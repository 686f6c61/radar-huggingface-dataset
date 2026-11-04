# DJLougen/pixelgen-torii

## Resumen

PixelGen-Torii es un modelo generativo de pixel art desarrollado por DJLougen que sustituye el índice one-hot clásico de un modelo de sprites por un punto en un toro tridimensional (T³ = S¹×S¹×S¹), donde cada círculo corresponde a un eje conceptual con nombre: vida (criatura u objeto), estado de ánimo (cute o scary) y forma (redonda o puntiaguda). El modelo no se entrena: sus 5.586 parámetros se escriben a mano en el espacio de pesos, con las 21 clases de cuerpo situadas manualmente como coordenadas angulares legibles (63 enteros) y 31 atributos que actúan como desplazamientos sobre un solo eje.

La propuesta es relevante por dos motivos. Primero, demuestra que una lectura basada en distribuciones de von Mises sobre un toro reproduce de forma bit a bit el comportamiento de un argmax sobre one-hots (24.192 de 24.192 prompts idénticos a PixelGen2), pero con un índice de cuerpo `Linear(V, 6)` en lugar de `Linear(V, 21)`, lo que reduce el coste de O(V·C) a O(V) y escala mucho mejor al añadir clases. Segundo, introduce aritmética de conceptos sin reglas por par: aplicar un atributo como `scary` a `slime` desplaza la coordenada por el anillo hasta caer en `ghost`.

Es, por tanto, una pieza de investigación en interpretabilidad y programación del espacio de pesos más que un modelo de producción: un generador de sprites PICO-8 con geometría explícita y verificable, útil para estudiar cómo la estructura del espacio latente determina la semántica de las composiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de sprites basado en índice sobre toro T³ (S¹×S¹×S¹) con lectura por producto de von Mises; sin transformer ni red neuronal entrenada |
| Parametros totales | 5.586 (variante completa `PixelGen2Torus`); 2.562 en la variante solo-cuerpos `PixelGenConcept` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no procesa texto libre, mapea palabras de un vocabulario cerrado) |
| Tipos de cuantizacion | no disponible (pesos enteros y flotantes escritos a mano; no se documentan cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; pesos definidos en código Python/PyTorch, `pixelgen/concept.py`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal convencional. PixelGen original seleccionaba un sprite mediante `Linear(V, C) → argmax`, un one-hot sobre clases sin geometría. PixelGen-Torii reemplaza esa capa por una proyección `Linear(V, 6)`: cada palabra de clase emite tres vectores unitarios (cos θ, sin θ) correspondientes a los ejes vida, estado de ánimo y forma. Cada una de las 21 clases de cuerpo está situada a mano en un ángulo de cada círculo (`COORDS`, 63 enteros). Los 31 atributos (`scary`, `round`, `object`, etc.) emiten un vector más largo sobre un único círculo, de modo que sobrescriben ese eje y dejan intactos los demás.

La lectura es un producto de distribuciones de von Mises con κ = 20: `w_c = softmax_c κ · Σ_i cos(θ_i − θ_c,i)`. A partir de ahí se calcula `half = Σ_c w_c · template_c`, seguido de umbral, espejo, contorno, sombreado y paleta, exactamente igual que en PixelGen. No hay pasos de entrenamiento (0 training steps): los pesos son enteros y flotantes escritos a mano, verificables mediante lectura inversa con `atan2` (21/21 clases reproducidas), prueba causal (intercambiar columnas de `slime` y `skull` cambia el comportamiento) y ablación con métrica ciega a coordenadas (solidez de máscara). No se documentan datos de entrenamiento, RLHF ni DPO porque no existen.

## Capacidades

- Generación de sprites de pixel art a partir de un vocabulario cerrado de palabras de clase y atributo en inglés.
- Aritmética de conceptos: aplicar un atributo desplaza la clase sobre un eje concreto (`scary slime` → `ghost`, `pointy cherry` → `star`, `round sword` → `bomb`).
- Composición de cuerpo más accesorios, segundo color, sombreado y tamaño en la variante `PixelGen2Torus` (heredado de PixelGen2).
- Interpretabilidad verificable: cada clase es una coordenada angular legible y auditable.
- Detección de huecos semánticos: cuando no existe una clase adecuada, la salida se reparte entre dos clases con pesos divididos en lugar de producir un resultado erróneo con alta confianza (por ejemplo, `creature sword` → invader 62% / bat 38%).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no; solo inglés.

## Casos de uso

- Investigación en interpretabilidad de espacios latentes: el modelo permite estudiar cómo la colocación manual de 21 coordenadas angulares determina la semántica de las composiciones, comparando anillos curados frente a aleatorios con el mismo mecanismo y los mismos pesos.
- Docencia sobre programación del espacio de pesos: sirve para explicar la diferencia entre un índice one-hot sin geometría y un índice con geometría explícita, con verificación bit a bit incluida.
- Generación de assets para juegos con paleta PICO-8: produce sprites de criaturas y objetos con accesorios y colores coherentes para prototipos de juego de forma determinista y reproducible.
- Pruebas de escalabilidad de vocabulario: permite medir el coste de añadir clases (O(V) frente a O(V·C)) y validar el comportamiento del índice a 10.000 clases (180.000 parámetros frente a 300 millones del índice denso).
- Experimentos de aritmética de conceptos: se pueden diseñar bancos de pruebas de pares atributo-clase para analizar qué desplazamientos caen en una clase única con más del 90 % de peso y cuáles se dividen.
- Generación de datasets sintéticos controlados: al ser determinista y no entrenado, permite producir conjuntos de sprites con etiquetas semánticas exactas para evaluar otros modelos de visión o de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye métricas internas de verificación, que se recogen a continuación:

| Metrica | Resultado |
|---|---|
| Identidad bit a bit con PixelGen (solo cuerpos, κ=20) | 212/212 prompts × 2 semillas |
| Identidad bit a bit con PixelGen2 (modelo completo) | 24.192/24.192 prompts enumerados |
| Aterrizaje en una sola clase con >90 % de peso | 41 de 48 prompts atributo+clase |
| Verificación por lectura inversa (`atan2`) | 21/21 clases reproducidas |
| Salidas distintas en semilla 0 (PixelGen2 → Torus) | 19.269 → 22.023 (+14 % con seis palabras de atributo) |
| Parámetros (PixelGen2 → Torus) | 8.091 → 5.586 (−31 %) |
| Índice de cuerpo a V=166 | 1.002 params (Torus) frente a 3.507 (one-hot) |
| Ablación de solidez (colocación curada) | `round` +0,219 más sólido que `pointy` |
| Ablación de solidez (colocación aleatoria ×5) | +0,126 ± 0,235; aterrizajes confiados 85 % → 59 % |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; con 5.586 parámetros y plantillas dibujadas a mano, la inferencia cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (RTX 4090, RTX 3060, A100, H100) ejecuta el modelo sin problema. En CPU la latencia es de milisegundos por sprite.
- Cabe en cualquier GPU consumer; también en entornos sin GPU.
- Opciones de despliegue: PyTorch en script local, o la demo oficial en Hugging Face Spaces (https://huggingface.co/spaces/DJLougen/pixelgen-torii). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma numérica; por el tamaño, se espera latencia despreciable y throughput limitado únicamente por el renderizado de las plantillas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Indice de cuerpo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PixelGen-Torii | 5.586 | no aplica | 0 pasos (pesos a mano) | Linear(V, 6) sobre T³ | MIT | Hugging Face + Space |
| PixelGen2 | 8.091 | no aplica | pesos a mano | Linear(V, 21) one-hot | MIT | Hugging Face |
| PixelGen (solo cuerpos) | 2.562 (variante concepto) | no aplica | pesos a mano | Linear(V, 21) one-hot | MIT | Hugging Face |
| PixelGenConcept | 2.562 | no aplica | pesos a mano | Linear(V, 6) sobre T³ | MIT | Hugging Face |

No se dispone de comparación con modelos de difusión de pixel art de mayor tamaño porque la información proporcionada no los incluye.

## Limitaciones y advertencias

- Vocabulario cerrado y en inglés: solo reconoce las 21 clases de cuerpo y 31 atributos definidos a mano; no procesa lenguaje natural libre.
- No es un modelo entrenado: no generaliza más allá de las plantillas y coordenadas escritas por el autor.
- Riesgo de salidas divididas: cuando no existe una clase adecuada, el resultado se reparte entre dos clases (`creature sword` → invader 62 % / bat 38 %); es un comportamiento intencionado, pero puede sorprender en producción.
- La semántica depende por completo de la colocación manual de las coordenadas: con un anillo aleatorio, el mecanismo funciona igual pero la clase intermedia cambia (`slime skull` → `invader` en lugar de `ghost`), y los aterrizajes confiados caen del 85 % al 59 %.
- Sesgos conocidos: no se documentan sesgos sociales; el sesgo relevante es el de diseño del autor en la elección de clases y atributos.
- Licencia MIT: permite uso comercial y modificación, pero el repo no incluye pesos en formato estándar (safetensors, GGUF), por lo que la integración requiere ejecutar el código Python.
- Repo de 0.0 GB y sin descargas ni likes en el momento de la consulta: madurez y mantenimiento no verificables.
- No apto para tareas de texto, razonamiento, código, visión general ni agentes; su alcance es exclusivamente la generación de sprites PICO-8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DJLougen/pixelgen-torii
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/DJLougen/pixelgen-torii
- PixelGen (modelo base): https://huggingface.co/DJLougen/pixelgen2
- PixelGen2 (modelo composicional del que deriva): https://huggingface.co/DJLougen/pixelgen2
