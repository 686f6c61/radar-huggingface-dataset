# PowerPotato/PowerPotato-Gesture-10KB

## Resumen

PowerPotato-Gesture-10KB es un clasificador de gestos de muñeca a partir de datos de acelerómetro de tres ejes, publicado por el usuario PowerPotato en Hugging Face bajo licencia MIT. Se trata de una red convolucional 1D personalizada de aproximadamente 2.000 parámetros (el autor la cifra en "2k") que ocupa alrededor de 10 kilobytes en disco, con una entrada fija de `[1, 3, 30]` (lote, ejes Ax/Ay/Az, 30 instantes temporales remuestreados) y una salida de `[1, 5]` clases. Su propósito declarado es controlar la reproducción de vídeos cortos verticales (tipo YouTube Shorts) mediante gestos como sacudidas de muñeca o golpes en la parte posterior del dispositivo.

El interés del modelo es fundamentalmente práctico y educativo dentro del ámbito tinyML: demuestra que una tarea de reconocimiento de gestos puede entrenarse en unos dos minutos dentro de Termux sobre la CPU de un teléfono y ejecutarse después de forma totalmente local, sin GPU ni nube, mediante ONNX Runtime Web. Esto lo convierte en un ejemplo útil de inferencia en el borde con requisitos de memoria y batería mínimos, y en un punto de partida reproducible para prototipos de control gestual en wearables, navegador y microcontroladores.

Ahora bien, conviene subir las expectativas al terreno de lo que realmente es: un clasificador de sensores de cinco clases, no un modelo de lenguaje. No tiene ventana de contexto, no procesa texto, audio ni imagen, y toda su documentación procede de la propia model card del autor, sin dataset, protocolo de evaluación ni benchmarks estándar publicados. El repositorio acumula 0 descargas y 1 "like" en el momento de redactar esta ficha, y su tamaño declarado es de 0,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN 1D personalizada sobre series temporales de acelerómetro (3 canales de entrada) |
| Parámetros totales | ~2.000 (el autor indica "2k parameters") |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 30 instantes temporales × 3 ejes (`[1, 3, 30]`) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la entrada es numérica) |
| Licencia | MIT |
| Formato de pesos | ONNX (inferencia); PyTorch se menciona como framework de entrenamiento. El listado exacto de ficheros del repositorio no está disponible y el tamaño declarado del repo es 0,0 GB |
| Salida | 5 clases de probabilidad (`[1, 5]`): flick down, flick up, wrist twist, back knock e idle |
| Etiqueta de pipeline | tabular-classification |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D "microscópica" definida por el autor, que consume 30 instantes temporales remuestreados de acelerómetro de tres ejes (`Ax, Ay, Az`) y produce un vector de cinco probabilidades, una por clase. No se especifica el número de capas, los tamaños de kernel, el uso de pooling, normalización o dropout, ni si existe una fase densa final. Con ~2.000 parámetros, la capacidad del modelo es muy limitada, lo que resulta coherente con su objetivo: discriminar patrones cinemáticos simples y bien separados con una huella de memoria mínima.

En cuanto al entrenamiento, la model card indica únicamente que el modelo se entrenó en unos dos minutos dentro de Termux sobre la CPU de un teléfono móvil. No se documenta el número de muestras, la composición del dataset, los sujetos participantes, los dispositivos de captura, la frecuencia de muestreo original, el remuestreo aplicado, la partición de entrenamiento/validación ni si hubo ajuste fino posterior. Tampoco aplican técnicas de alineación tipo RLHF o DPO, propias de modelos generativos. La innovación destacable es de ingeniería más que algorítmica: el modelo se exporta a ONNX y se ejecuta con ONNX Runtime Web en JavaScript, recibiendo un tensor `float32` plano de 90 valores (`accel_input`) y devolviendo el tensor `probabilities`, lo que permite inferencia en navegador y en dispositivos sin acelerador gráfico.

## Capacidades

- Clasificación de gestos de muñeca a partir de acelerómetro de tres ejes, con salida de 5 clases.
- Mapeo de gestos a acciones concretas: flick down (siguiente vídeo / desplazar abajo), flick up (vídeo anterior / desplazar arriba), wrist twist (doble toque "me gusta"), back knock (pausa / reproducción) e idle (ignorado).
- Filtrado por confianza y amortiguación por tiempo de espera ("cooldown debouncing") para reducir falsos positivos, según el autor.
- Inferencia 100 % local en CPU, sin servidor ni conexión de red, con una tasa declarada de 60+ FPS.
- Ejecución en navegador mediante ONNX Runtime Web y en microcontroladores o teléfonos de gama baja, según el autor.
- Entrenamiento y reentrenamiento viables en un dispositivo móvil con Termux en cuestión de minutos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No genera texto, código ni matemáticas; no tiene capacidades de visión, audio ni multilingües.

## Casos de uso

- Control gestual de vídeo corto vertical: integrado en una aplicación Android o iOS, el modelo puede leer el acelerómetro del teléfono en una ventana deslizante y emitir acciones de siguiente/anterior/pausa/me gusta sin que el usuario toque la pantalla. Es adecuado por su huella de 10 KB y su inferencia en CPU a más de 60 FPS, que evita competir por la GPU con la decodificación de vídeo.
- Wearables y smartwatches de bajo consumo: al ejecutarse sobre datos de acelerómetro y con un consumo que el autor califica de prácticamente nulo, encaja en dispositivos con batería pequeña y microcontroladores con recursos muy limitados.
- Accesibilidad para personas con movilidad reducida: usuarios que no pueden alcanzar la pantalla de forma fiable pueden activar pausa, reproducción o desplazamiento mediante sacudidas y golpes, con la clase idle actuando como filtro de actividad normal.
- Domótica e IoT gestual: un mando o pulsera con acelerómetro puede enviar comandos (encender luz, cambiar escena) clasificando gestos localmente antes de transmitir únicamente la etiqueta, lo que reduce tráfico y evita enviar datos crudos de movimiento a la nube.
- Aplicación web o PWA sin backend: usando ONNX Runtime Web, la inferencia puede ejecutarse íntegramente en el navegador a partir del sensor de movimiento del dispositivo, sin coste de servidor ni tratamiento de datos personales fuera del cliente.
- Robótica educativa y proyectos maker: sirve como bloque de percepción para que un robot o vehículo didáctico reaccione a gestos de la mano o de una pulsera con acelerómetro, en talleres donde no se dispone de GPU.
- Docencia e investigación en tinyML: constituye un caso de estudio reproducible de extremo a extremo (captura de sensores, remuestreo a 30 instantes, entrenamiento en móvil, exportación a ONNX y despliegue en navegador) para explicar compromisos entre tamaño, latencia y precisión.
- Monitorización de actividad en fitness: la distinción entre idle y gestos activos puede aprovecharse para segmentar actividad y evitar registros espurios por movimiento cotidiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas sobre conjuntos estándar (MMLU, HumanEval, GSM8K y similares no son aplicables, ya que no es un modelo de lenguaje), ni tampoco una evaluación reproducible sobre un dataset de gestos con partición de test identificable. El único dato de rendimiento disponible es una afirmación cualitativa del propio autor:

| Métrica | Valor declarado | Observaciones |
|---|---|---|
| Precisión | 95 % o superior | Afirmación del autor, condicionada a filtrado por confianza y "cooldown debouncing"; no se especifica dataset, número de muestras, partición ni protocolo |
| Velocidad de inferencia | 60+ FPS en CPU de móvil o microcontrolador | Afirmación del autor; no se indica el hardware exacto, la latencia por inferencia ni el consumo medido |
| Consumo de batería | "Prácticamente 0 %" | Afirmación del autor; sin medición publicada |
| Tamaño | ~10 KB | Coherente con el tamaño declarado del modelo; el repositorio figura como 0,0 GB |

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU. El fichero ONNX ocupa alrededor de 10 KB y la huella en memoria del proceso es del orden de kilobytes a pocos megabytes (estimación razonable, no publicada por el autor).
- GPU recomendadas: ninguna. Aceleradores como A100, H100 o RTX 4090 no aportan ventaja medible para un modelo de ~2.000 parámetros; el cuello de botella sería la sobrecarga de lanzamiento de kernels.
- Cabe en GPU de consumo: sí, y también en cualquier CPU de teléfono, navegador o microcontrolador, que es su destino declarado.
- Opciones de despliegue: ONNX Runtime, incluido ONNX Runtime Web para navegador (documentado explícitamente en la model card), PyTorch para entrenamiento o reentrenamiento, y eventualmente conversiones a formatos de microcontrolador o TensorFlow Lite, aunque el autor no las documenta. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: el autor declara más de 60 FPS de inferencia en CPU de móvil; la latencia por inferencia, el consumo energético medido y el throughput en hardware concreto no están disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible, y el autor no incluye ninguna comparación con alternativas del mismo tamaño o de la misma tarea (por ejemplo, otros clasificadores tinyML de gestos). La tabla siguiente recoge únicamente los datos verificables del modelo descrito:

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| PowerPotato-Gesture-10KB | ~2.000 | `[1, 3, 30]` (acelerómetro 3 ejes, 30 instantes) | MIT | Hugging Face; 0 descargas y 1 "like" en el momento de la consulta |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La precisión del 95 % es una afirmación del autor sin dataset, partición de test ni protocolo de evaluación publicados; no debe tratarse como una métrica verificada.
- El dataset de entrenamiento está completamente indocumentado: se desconoce el número de muestras, los sujetos, los dispositivos de captura, la colocación del sensor y la frecuencia de muestreo original.
- Riesgo de sobreajuste al dispositivo y a la colocación: al depender de solo 3 ejes y 30 instantes remuestreados, cambios en la orientación del sensor, la muñeca empleada o la cadencia de muestreo pueden degradar gravemente el rendimiento.
- Dependencia de posprocesado no publicado: la precisión declarada se obtiene con filtrado por confianza y "cooldown debouncing", cuyos umbrales no se especifican ni se incluyen en el repositorio, por lo que replicar el resultado es difícil.
- La afirmación de "cero falsos positivos" en estado idle es una declaración cualitativa; en condiciones reales de movimiento cotidiano los falsos positivos dependen críticamente de esos umbrales no documentados.
- Modelo cerrado a cinco clases: cualquier gesto adicional exige reentrenar la red, no basta con reconfigurar la salida.
- No es un modelo de lenguaje ni multimodal: carece de contexto textual, capacidades multilingües, tool calling, agentes o razonamiento multi-paso. Cualquier uso que requiera comprensión del lenguaje queda fuera de su alcance.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre conservando el aviso de copyright y sin garantía alguna. No hay restricciones adicionales conocidas, pero tampoco soporte ni mantenimiento comprometidos.
- Madurez del proyecto no demostrada: 0 descargas, 1 "like", tamaño de repositorio declarado de 0,0 GB y fechas de creación y actualización de 2026, posteriores a la fecha habitual de consulta, lo que impide contrastar la trayectoria del modelo.
- La etiqueta de pipeline `tabular-classification` es aproximada: los datos de entrada son series temporales de sensores, no una tabla convencional.
- En producción, conviene envolver el modelo con lógica propia de segmentación de ventana, calibración por usuario y control de falsos positivos, y validar con datos del dispositivo objetivo antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PowerPotato/PowerPotato-Gesture-10KB
- Paper o informe técnico: no disponible
- Repositorio de código: no disponible (no se referencia en la model card)
- Blog o artículo del autor: no disponible
- Demo en línea: no disponible
- Documentación de ONNX Runtime Web: no disponible como enlace en la información proporcionada (la model card menciona `onnxruntime-web` en el ejemplo de JavaScript, pero sin URL)
