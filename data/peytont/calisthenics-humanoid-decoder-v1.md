# PeytonT/calisthenics-humanoid-decoder-v1

## Resumen

El calisthenics compact humanoid decoder v1 es un modelo experimental de visualización landmark-to-mesh desarrollado por PeytonT y destilado localmente a partir de Momentum Human Rig (MHR) de Meta. No es un estimador de pose por vídeo, ni un port del codificador de imágenes SAM, ni evidencia de mejor precisión articular. Su función es convertir un conjunto de anclas corporales y de mano en una malla 3D renderizable dentro de una aplicación de calistenia.

El paquete de datos ocupa 283.026 bytes y describe 7.228 vértices, 14.505 triángulos y 55 huesos de control. La inferencia se ejecuta en el navegador con un kernel WASM/SIMD y fallback escalar en JavaScript, y el dibujado usa WebGL 2. La entrada es un array de 73 anclas compatibles con MHR más centros de cadera, hombro y oreja. Destaca por su compresión extrema y su ejecución íntegra en cliente, sin vídeo ni imágenes enviadas a servidores.

Se trata de una liberación experimental de un modelo de visualización. Las métricas publicadas miden error de reconstrucción de malla frente al profesor, no precisión anatómica de pose. El rendimiento en iPhone y Android no está validado y la forma corporal es un prior neutro, no la del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de skinning local aprendido con tres influencias sobre topología MHR; no es un transformer de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de malla 3D, no de secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | sam-and-apache-2.0 (SAM License + Apache-2.0) |
| Formato de pesos | datos de pesos empaquetados (packed weight data) del Model Stack; runtime en módulos .mjs y WebAssembly (no safetensors ni GGUF) |
| Entrada | array de 73 anclas: puntos semánticos cuerpo/mano compatibles con MHR más centro de cadera, centro de hombro y centro de oreja |
| Salida | malla 3D con 7.228 vértices y 14.505 triángulos, articulada por 55 huesos de control |
| Tamaño del paquete | 283.026 bytes |

## Arquitectura y entrenamiento

El modelo implementa un skinning de coordenadas locales aprendido con tres influencias, que mezcla las coordenadas de superficie aprendidas para producir la malla final. No se trata de un transformer de lenguaje ni de un modelo de difusión: es un decodificador compacto que la aplicación anfitriona alimenta con landmarks corporales y de mano ya ajustados temporalmente. La aplicación convierte sus 33 puntos corporales y 21 puntos por mano observada al formato de 73 anclas, y el decodificador no modifica las coordenadas articulares, las anotaciones de habilidad, las puntuaciones de forma ni los temporizadores.

El entrenamiento reutilizó `transformer_10/compress/distill.py:mse_match` y la separación del Model Stack entre datos de pesos empaquetados y código de runtime propiedad del navegador. Para el skinning se emplearon 384 articulaciones sintéticas de MHR, 64 articulaciones de validación para selección de checkpoint y un test sintético final independiente de 96 articulaciones. No se incluye vídeo fuente, imagen privada, coeficiente de identidad de usuario ni clip subido en el repositorio; el entrenamiento usa una identidad MHR genérica neutra. La malla móvil retiene vértices entrenados seleccionados y colapsa vértices neutros cercanos.

## Capacidades

- Conversión de landmarks a malla: transforma un array de 73 anclas (puntos semánticos de cuerpo y mano compatibles con MHR, más centros de cadera, hombro y oreja) en una malla 3D conectada de cuerpo y dedos.
- Representación de manos registradas en muñeca: la aplicación aporta 21 puntos por mano observada y el decodificador dibuja los dedos correspondientes.
- Ocultación selectiva: cuando faltan huesos de soporte o su confianza es baja, se ocultan los triángulos de malla afectados.
- Ejecución en navegador: kernel WASM/SIMD con fallback escalar en JavaScript y renderizado con WebGL 2.
- Carga verificada de activos: el cargador del navegador comprueba el manifiesto y el SHA-256 del modelo, y cachea las descargas.
- No soporta tool calling, function calling ni agentes multi-paso.
- No tiene capacidades multilingües ni de generación de texto, código, matemáticas, visión o audio.
- No incorpora modo thinking ni decodificación especulativa.

## Casos de uso

- Visualización de posturas de calistenia en una aplicación de entrenamiento: el decodificador recibe los landmarks ya ajustados por la app y dibuja el cuerpo y los dedos en el navegador, sin necesidad de renderizar en servidor.
- Seguimiento de agarres y contacto de mano: al recibir 21 puntos por mano observada, permite representar la apertura y posición de los dedos en ejercicios con agarre, como dominadas o fondos en anillas.
- Previsualización de bajo coste en cliente: con un paquete de 283.026 bytes, encaja en aplicaciones web que necesitan una malla humana ligera sin descargar modelos de gran tamaño.
- Integración en pipelines de fitness existentes: la app anfitriona puede seguir aportando sus propios scores de forma, anotaciones de habilidad y temporizadores, ya que el decodificador no los altera.
- Degradación controlada ante pérdida de tracking: si una extremidad queda fuera de cuadro o con baja confianza, el modelo oculta los triángulos afectados en lugar de mostrar una geometría inventada.
- Prototipado e investigación sobre skinning local: sirve como referencia para estudiar un esquema de tres influencias destilado y su paridad entre modelo completo y runtime compacto, documentada en `validation.json`.
- Demostraciones de visualización neutra: al usar una identidad MHR genérica, permite generar figuras humanas neutras para pruebas de interfaz sin exponer datos biométricos de usuarios.

## Benchmarks y rendimiento

| Metrica | Antes (profesor) | Despues (decodificador) | Mejora |
|---|---|---|---|
| Error medio de superficie (unidades de modelo) | 0,019107 | 0,016003 | 16,2% de reduccion |
| p95 de error de superficie (unidades de modelo) | 0,049603 | 0,043963 | reduccion |
| Desplazamiento maximo de vertices neutros representativos (malla movil) | no disponible | 0,032946 unidades de modelo | no aplica |
| Latencia del decoder WASM en escritorio | no disponible | ~0,2 ms | no aplica |

Estas cifras son errores de reconstrucción de malla frente al profesor, no precisión anatómica de pose, y preceden a la reducción de LOD de la malla. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- No requiere VRAM de GPU dedicada: la inferencia del decodificador se ejecuta en el navegador mediante WebAssembly/SIMD, con fallback escalar en JavaScript.
- El paquete de datos ocupa 283.026 bytes, por lo que la descarga y el almacenamiento en cliente son mínimos.
- Se necesita un navegador con soporte de WebGL 2 y de WebAssembly; el renderizado de la malla usa WebGL 2.
- GPU recomendadas: no aplica en el sentido de GPU de centro de datos (A100, H100); cualquier GPU integrada o discreta capaz de ejecutar WebGL 2 es suficiente en principio.
- Cabe en cualquier GPU de consumo y en GPU integradas, al no depender de cómputo tensorial pesado en servidor.
- Probado en Chromium de escritorio, incluido un viewport de 390 píxeles; el rendimiento real en iPhone y Android no está validado.
- El decodificador WASM en escritorio ronda los 0,2 ms, pero el autor indica que el trabajo completo del visor es materialmente más costoso; no se proporcionan cifras de latencia o throughput del visor completo.
- Opciones de despliegue: navegador web con los módulos `humanoid-model.mjs`, `humanoid-view.mjs` y `wasm/humanoid/decode.c`; no aplica vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican modelos comparables de la misma categoría (decodificadores landmark-to-mesh compactos para visualización en navegador). Los componentes upstream citados, Momentum Human Rig (MHR) y el mapeo semántico/topología de SAM 3D Body, son las fuentes de las que deriva este modelo, no alternativas desplegables equivalentes.

## Limitaciones y advertencias

- No es un estimador de pose por vídeo: la aplicación debe aportar los landmarks corporales y de mano previamente ajustados.
- No mejora la precisión articular; la malla hereda los errores de la pose de entrada y no puede reparar una rodilla mal colocada ni revelar un tobillo ocluido.
- Las métricas publicadas (0,019107 a 0,016003 de error medio de superficie) son errores de reconstrucción de malla frente al profesor, no precisión anatómica de pose.
- Quedan sin verificar los errores de articulaciones monoculares, los miembros ocultos, la identidad en escenas concurridas, la calibración de cámara, el contacto de palma y la supinación.
- El rendimiento real en iPhone y Android no está validado; solo se probó en Chromium de escritorio, incluido un viewport de 390 píxeles.
- La forma corporal es un prior neutro, no la forma corporal medida del usuario.
- Un refinador de imagen/pose entrenado previamente no superó la puerta conservadora de confianza de articulaciones faltantes y no se incluye ni promociona.
- Licencias: el modelo se distribuye bajo sam-and-apache-2.0, con la SAM License y Apache-2.0 incluidas; al redistribuir derivados deben conservarse los términos y avisos de los proyectos upstream (MHR y SAM 3D Body).
- Esta liberación es un experimento de modelo de visualización compacto y no cuenta con el respaldo de Meta.
- Riesgo de alucinación en el sentido habitual de los modelos de lenguaje: no aplica, pero sí existe el riesgo de heredar y representar errores de la pose de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PeytonT/calisthenics-humanoid-decoder-v1
- Momentum Human Rig (MHR) de Meta: https://github.com/facebookresearch/MHR
- SAM 3D Body de Meta: https://github.com/facebookresearch/sam-3d-body
- Licencia SAM incluida en el repositorio: https://huggingface.co/PeytonT/calisthenics-humanoid-decoder-v1/blob/main/LICENSE-SAM.txt
