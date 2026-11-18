# AnticPan/mini-pixel-art

## Resumen

mini-pixel-art es una familia de cuatro modelos de difusión texto-a-imagen de tamano extremadamente reducido (entre 1,93 y 8,75 millones de parametros) desarrollada por el usuario AnticPan. Su proposito es generar sprites de pixel art de 16×16 pixeles a partir de descripciones textuales cortas, operando directamente en espacio de pixeles sin VAE ni codificador de texto preentrenado. Esto reduce drasticamente los requisitos de computo y permite ejecutar la inferencia en un navegador mediante WebGPU.

La familia se compone de cuatro variantes: `s-p1` (1,93M), `m-p1` (4,35M, recomendada), `l-p1` (8,75M) y `m-p2` (4,36M, con parches de 2×2 pixeles para mayor velocidad). Todas emplean una arquitectura DiT (Diffusion Transformer) de flujo unico con 4 cabezas de atencion y un modelo de flow-matching. El texto se procesa mediante una tabla de 10.944 palabras construida a partir de las leyendas de entrenamiento, sin transformer de texto.

El modelo resulta relevante por su enfoque minimalista: demuestra que es posible generar pixel art coherente con menos de 10M de parametros y un peso de 4,5 MB en int8, lo que habilita su despliegue en entornos con recursos muy limitados, incluidos navegadores. Se distribuye bajo licencia MIT y esta entrenado sobre el dataset Angais/pixel-art-atlas-1.4m.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de flujo unico, 4 cabezas, flow-matching |
| Parametros totales | 1,93M (s-p1) / 4,35M (m-p1) / 8,75M (l-p1) / 4,36M (m-p2) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (texto tokenizado como maximo 12 ids de palabra) |
| Tipos de cuantizacion | int8 (m-p1, l-p1), fp32 (s-p1, m-p2); ONNX fp32 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (opset 17), PyTorch |

## Arquitectura y entrenamiento

Cada variante es un DiT de flujo unico con 4 cabezas de atencion. La anchura y el numero de bloques varian segun el modelo: 128×6 para `s-p1`, 192×8 para `m-p1` y `m-p2`, y 256×10 para `l-p1`. El texto no se procesa con un transformer: se divide en palabras y se consulta una tabla de 10.944 entradas construida a partir de las leyendas del dataset de entrenamiento. La salida es una imagen RGBA continua en el rango [-1, 1] que posteriormente se cuantiza a la paleta de 4.096 colores del dataset (los pixeles con alpha inferior a 0 se vuelven transparentes).

El entrenamiento emplea flow-matching con una perdida que aplica `max(t, 0.05)`, lo que sesga las predicciones por debajo de t=0.05 y obliga a detener el muestreo en ese umbral. El dataset es Angais/pixel-art-atlas-1.4m. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La variante `m-p2` usa parches de 2×2 pixeles (64 tokens de pixel en lugar de 256), lo que la hace aproximadamente 2,5 veces mas rapida que `m-p1` a costa de algo menos de detalle.

## Capacidades

- Generacion de texto a imagen de sprites de pixel art de 16×16 pixeles en formato RGBA.
- Generacion condicionada por leyendas cortas en ingles, preferiblemente frases nominales con palabras de vista (`front-view`, `side-view`, `three-quarter-view`, `top-down`).
- Inferencia directa en espacio de pixeles sin VAE ni codificador de texto preentrenado.
- Ejecucion en navegador mediante WebGPU (con fallback a CPU).
- Exportacion a ONNX (opset 17, fp32, batch dinamico) para inferencia sin PyTorch.
- Sampler Euler de 16 pasos con classifier-free guidance (1,5 en RGB y alpha; 1,0 en alpha para `l-p1`).
- Soporte de generacion por lotes (batch) tanto en PyTorch como en ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles (vocabulario cerrado de 10.944 palabras).

## Casos de uso

- Generacion de assets para videojuegos indie: el modelo produce sprites de 16×16 listos para usar en motores 2D, con transparencia incluida, lo que acelera la iteracion de prototipos sin necesidad de un artista dedicado.
- Creacion de iconos y elementos de interfaz retro: util para generar iconos de inventario (pociones, llaves, cofres) en estilo pixel art coherente con una paleta fija de 4.096 colores.
- Demos interactivas en navegador: al ejecutarse con WebGPU y pesar 4,5 MB en int8, permite integrar un generador de sprites en una pagina web sin backend ni subida de datos.
- Prototipado rapido de conceptos visuales: un disenador puede generar variaciones de un mismo sujeto con distintas semillas (8 por leyenda) para explorar direcciones artisticas antes de producir el asset final.
- Educacion y divulgacion sobre modelos de difusion: su tamano reducido y su codigo abierto (MIT) lo hacen adecuado para explicar flow-matching, DiT y cuantizacion en entornos docentes.
- Generacion de datasets sinteticos de pixel art: util para aumentar datos de entrenamiento en tareas de clasificacion o deteccion de sprites, con control sobre la paleta y el sujeto.
- Integracion en pipelines de CI/CD para pruebas visuales: la version ONNX permite verificar de forma determinista (mismos pixeles con el mismo ruido) que los cambios en el pipeline no rompen la generacion.

## Benchmarks y rendimiento

Los resultados se calculan sobre 4.096 leyendas retenidas con sus imagenes reales (filas del split oficial de train nunca usadas en entrenamiento). La metrica "Subject hit" mide la precision top-1 de un clasificador entrenado con imagenes reales (referencia real: 0,733). "Feature Fréchet" es la distancia de Fréchet en el espacio de caracteristicas de ese clasificador. "Real/fake AUC" mide la discriminabilidad (0,5 = indistinguible). "Colours / image" es el numero medio de colores por imagen (referencia real: 22,3).

| Modelo | Parametros | Subject hit ↑ | Feature Fréchet ↓ | Real/fake AUC ↓ | Colores / imagen |
|---|---|---|---|---|---|
| s-p1 | 1,93M | 0,609 | 6,02 | 0,557 | 53,6 |
| m-p1 | 4,35M | 0,692 | 5,41 | 0,533 | 50,7 |
| l-p1 | 8,75M | 0,714 | 4,96 | 0,528 | 47,9 |
| m-p2 | 4,36M | 0,684 | 5,84 | 0,536 | 66,7 |
| UbaNova-16 | 42,4M | 0,448 | 9,62 | 0,786 | 21,1 |
| tessera-small | 47,6M | 0,693 | 13,31 | 0,703 | 19,5 |
| pixelsprite-canvas-v2 | 39,1M | 0,430 | 7,16 | 0,630 | 23,8 |

El autor advierte que la comparacion no es equitativa: los modelos de la comunidad usan sus ajustes por defecto, sus propias paletas y probablemente fueron entrenados con las filas retenidas; ademas, sus recuentos de parametros excluyen los codificadores de texto congelados. Los numeros de la comunidad provienen de una ejecucion anterior con 32 pasos, no de la configuracion de release.

Velocidad para 16 pasos con guidance (excluyendo preprocesado de texto): en navegador con WebGPU (Mac con Apple Silicon, batch 8) aproximadamente 70 ms por imagen para `s-p1` (dato parcial en la informacion disponible; el resto de la tabla de velocidades esta truncado).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las variantes; los pesos van de 4,5 MB (m-p1 int8) a 17,4 MB (m-p2 fp32).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Funciona en CPU y en navegador con WebGPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, iGPU recientes) y en Apple Silicon.
- Opciones de despliegue: PyTorch nativo (`mini_pixel_art.py`), ONNX Runtime (`mini_pixel_art_onnx.py`), navegador con WebGPU (demo oficial). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo).
- Latencia: aproximadamente 70 ms por imagen en WebGPU con Apple Silicon y batch 8 para `s-p1`; `l-p1` es aproximadamente 1,8 veces mas lento que `m-p1`; `m-p2` es aproximadamente 2,5 veces mas rapido que `m-p1`. El resto de datos de throughput no esta disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Subject hit | Feature Fréchet | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mini-pixel-art m-p1 | 4,35M | 16×16 px | 0,692 | 5,41 | MIT | Hugging Face, ONNX, WebGPU |
| mini-pixel-art l-p1 | 8,75M | 16×16 px | 0,714 | 4,96 | MIT | Hugging Face, ONNX, WebGPU |
| UbaNova-16 | 42,4M | 16×16 px | 0,448 | 9,62 | No disponible | No disponible |
| tessera-small | 47,6M | 16×16 px | 0,693 | 13,31 | No disponible | No disponible |
| pixelsprite-canvas-v2 | 39,1M | 16×16 px | 0,430 | 7,16 | No disponible | No disponible |

Los tres modelos de la comunidad tienen entre 4 y 5 veces mas parametros que `m-p1`, pero obtienen peores resultados en las metricas del autor (con las salvedades metodologicas ya indicadas). No se dispone de informacion sobre sus licencias ni canales de distribucion en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo genera sprites de 16×16 pixeles; no escala a resoluciones mayores.
- Vocabulario cerrado de 10.944 palabras: las palabras fuera de el se ignoran (el script las imprime), lo que limita la expresividad de las leyendas.
- Solo admite ingles; no hay soporte multilingue.
- El sampler debe detenerse en `t_stop = 0.05`; usar mas de 16 pasos empeora la calidad porque el modelo fue entrenado con `max(t, 0.05)`.
- Riesgo de alucinacion visual: el "subject hit" de `m-p1` es 0,692 frente a 0,733 de las imagenes reales, por lo que aproximadamente un 30% de las generaciones no representan correctamente el sujeto solicitado.
- La paleta esta fijada a 4.096 colores del dataset; no se puede personalizar sin reentrenar o postprocesar.
- La licencia MIT permite uso comercial, pero no se especifican garantias ni condiciones adicionales sobre el dataset de entrenamiento (Angais/pixel-art-atlas-1.4m), cuya licencia no se detalla en la informacion disponible.
- No soporta tool calling, agentes, vision ni audio; es exclusivamente texto-a-imagen.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- La reproducibilidad entre PyTorch y ONNX no es exacta para el ruido inicial: la misma semilla produce imagenes distintas en los dos scripts (aunque con el mismo ruido la salida coincide a 2e-5 por paso).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnticPan/mini-pixel-art
- Repositorio de codigo: https://github.com/AnticPan/mini-pixel-art
- Demo en navegador (WebGPU): https://anticpan.github.io/mini-pixel-art/
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
