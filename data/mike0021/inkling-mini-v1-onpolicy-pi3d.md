# Mike0021/inkling-mini-v1-onpolicy-pi3d

## Resumen

`inkling-mini-v1-onpolicy-pi3d` es un adaptador LoRA de rango 16 desarrollado por el usuario Mike0021 sobre el modelo base `thinkingmachines/Inkling-2-Mini`. Su propósito es especializar el modelo en la generación de escenas 3D con Three.js dentro de sesiones multi-turno del agente Pi 1.6.0, mediante una técnica de destilación de contexto on-policy a partir de trayectorias reales de conversación. El adaptador se entrenó en la infraestructura Tinker (nivel gratuito, contexto de 64K) y se publica bajo licencia Apache 2.0.

La relevancia del proyecto radica en su enfoque metodológico: en lugar de ajustar el modelo sobre pares pregunta-respuesta estáticos, se destila el comportamiento del agente Pi durante sesiones reales de modelado 3D, incluyendo capturas de pantalla como señales multimodales. El conjunto de datos de entrenamiento contiene 34 filas de entrenamiento y 8 de validación, con 199 capturas de pantalla referenciadas, y combina 11 sujetos 3D con 9 tareas generales de retención del agente Pi para mitigar el olvido catastrófico.

Un dato crítico para cualquier evaluador: la model card indica explícitamente que **no se publican los pesos del adaptador**. El checkpoint original se guardó como sampler de solo inferencia en Tinker y no pudo exportarse. Por tanto, el repositorio contiene únicamente la model card y los ejemplos de evaluación, con un tamaño de 0.0 GB. El modelo no es descargable ni desplegable fuera de la plataforma Tinker.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre modelo base multimodal `thinkingmachines/Inkling-2-Mini` |
| Parámetros totales | no disponible (solo se especifica el rango LoRA: 16) |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens (64K, configuración Tinker `peft:65536:free`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint guardado como sampler de solo inferencia en Tinker; sin pesos exportables) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre el modelo base multimodal `thinkingmachines/Inkling-2-Mini`, que opera con una ventana de contexto de 65.536 tokens. El entrenamiento emplea destilación de contexto on-policy: se capturan trayectorias multi-turno de sesiones reales de Pi 1.6.0 generando escenas Three.js, junto con trayectorias generales de retención de Pi, y se ajusta el modelo para reproducir ese comportamiento. La pérdida se calcula únicamente sobre los tokens del asistente.

Los hiperparámetros concretos son: rango LoRA 16, LR pico 1,5e-4 con warmup lineal y decaimiento coseno, batch size 4, 3 épocas (26 pasos), 3.568.065 tokens de entrenamiento y `effort=0.7` (equivalente a `--thinking medium` de Pi). La pérdida de validación (NLL) pasó de 0,4659 en el paso 0 a 0,4638 en la época 1, 0,4642 en la época 2 y 0,4645 en la época 3, lo que indica una mejora marginal y un ligero sobreajuste a partir de la época 2. El dataset exacto está publicado en el Hub (`Mike0021/inkling-mini-v1-onpolicy-pi3d-dataset`) con 34 filas de entrenamiento, 8 de validación y 199 capturas de pantalla referenciadas.

## Capacidades

- Generación de código Three.js para escenas 3D: geometría procedural, materiales, texturas procedurales e iluminación.
- Razonamiento visual multi-turno: inspección de capturas de pantalla renderizadas para iterar sobre el resultado 3D.
- Ejecución de tareas de agente Pi: edición de ficheros Python (`edit`/`bash`), conversión CSV a JSON y generación de HTML con SVG.
- Retención de capacidades generales del agente Pi: las 9 tareas de retención del dataset buscan preservar el comportamiento base.
- Procesamiento de imágenes como entrada (modelo base multimodal), con presupuesto de imágenes extendido a 64K.
- Modo de razonamiento configurable (`medium`/`high`) heredado del modelo base.
- Soporte de tool calling y ejecución en sandbox (bubblewrap) a través del agente Pi.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Generación automatizada de escenas Three.js: el adaptador produce código JavaScript funcional para escenas 3D (tractor, cabaña, pagoda, velero, máquina de escribir) con contratos de entrega verificables (0 errores JS/página), lo que lo hace adecuado para pipelines de generación de contenido 3D asistida por IA.
- Iteración visual sobre modelos 3D: el modelo inspecciona capturas de pantalla de renders y refina la geometría y los materiales en turnos sucesivos, con una mediana de 14,5 capturas inspeccionadas por tarea en la evaluación.
- Prototipado rápido de assets 3D para videojuegos o visualizaciones web: la mediana de 8.204 triángulos por sujeto en ejecuciones exitosas y 8,17 texturas procedurales medias indican un nivel de detalle suficiente para prototipos.
- Automatización de tareas de agente con ficheros: edición de código Python con tests, conversión de formatos (CSV a JSON) y generación de HTML con SVG, verificado en las pruebas de control anti-olvido (4/4 PASS).
- Investigación en destilación de contexto on-policy: el dataset publicado y la metodología documentada permiten reproducir o extender el enfoque a otros dominios de agente.
- Evaluación comparativa de adaptadores LoRA multimodales: los resultados por brief y las comparaciones ciegas pareadas sirven como referencia metodológica para medir especialización frente a retención.
- Formación de agentes especializados en dominios visuales: el patrón de capturas de pantalla como señal de entrenamiento es replicable en otros dominios (CAD, diseño gráfico, UI).

## Benchmarks y rendimiento

Los resultados provienen de la model card y comparan el checkpoint original V1 LoRA con el modelo base sin ajustar (`stock-med-free`), bajo condiciones idénticas (Pi 1.6.0, sandbox bubblewrap, `--thinking medium`, contexto 65.536, `maxTokens=16384`, presupuesto de 15 minutos, semilla 1).

Pruebas de control general de Pi (anti-olvido):

| Brazo | Thinking | Visión (`badge.png`) | Python `edit` + tests | CSV a JSON | HTML + SVG | Total |
|---|---|---|---|---|---|---|
| Stock | medium | PASS | PASS | PASS | PASS | 4/4 |
| V1 LoRA | medium | PASS | PASS (`bash`) | PASS | PASS | 4/4 |
| V1 LoRA | high | PASS | PASS (`edit`) | PASS | PASS | 4/4 |

Métricas agregadas sobre los 12 briefs 3D retenidos:

| Métrica | Stock Inkling 2 Mini | V1 LoRA original |
|---|---:|---:|
| Tasa de contrato de entrega (0 errores JS/página) | 11/12 | 12/12 (100%) |
| Mediana de triángulos por sujeto (ejecuciones exitosas) | 6.048 | 8.204 (+36%) |
| Media de texturas procedurales (exitosas / las 12) | 6,36 / 5,83 | 8,17 (+28% / +40%) |
| Mediana de capturas inspeccionadas | 11,0 | 14,5 |
| Veredictos ciegos pareados (72 totales) | 19 (26,4%) | 53 (73,6%) |
| Victorias ciegas consistentes con orden (12 briefs) | 7 | 24 (p = 0,0033) |
| Briefs retenidos ganados | 2/12 | 10/12 (p = 0,0386) |

Desglose por brief (extracto): `test2-tractor` stock FAIL frente a V1 OK con 13.956 triángulos (6:0); `test2-cabin` 4:2 a favor de V1; `test2-pagoda` 6:0; `test2-sailboat` 6:0; `test3-rowboat` 6:0; `test3-typewriter` 5:1; `test2-saguaro` 5:1; `test2-gramophone` 4:2; `test3-hydrant` 4:2. La model card menciona además un caso de fallo honesto (bug de grupo de sujetos en el piano) incluido en las comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador no es descargable; solo se ejecuta en la infraestructura Tinker.
- GPU recomendadas: no disponible. El entrenamiento se realizó en el nivel gratuito de Tinker, sin especificación de hardware.
- Compatibilidad con GPU de consumo: no aplicable, al no existir pesos exportables.
- Opciones de despliegue: exclusivamente el sampler de Tinker (`thinkingmachines/Inkling-2-Mini:peft:65536:free`). No hay pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no pueden cargarlo.
- Latencia y throughput: no disponible. Los tiempos por brief de la evaluación (entre 145 s y 905 s) corresponden a sesiones completas del agente Pi, no a inferencia aislada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| `inkling-mini-v1-onpolicy-pi3d` (este) | LoRA r16 sobre Inkling-2-Mini | 65.536 | Three.js / 3D vía agente Pi | Apache 2.0 | No (solo sampler Tinker) |
| `thinkingmachines/Inkling-2-Mini` (base) | no disponible | 65.536 | General multimodal | no disponible | Sí (modelo base) |
| Adaptadores LoRA genéricos para Three.js | variable | variable | Generación de código 3D | variable | Habitualmente sí (safetensors) |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada, por lo que la comparación cuantitativa se limita al par stock frente a V1 LoRA documentado en la model card.

## Limitaciones y advertencias

- **Sin pesos descargables**: la model card declara explícitamente que no hay pesos del adaptador. El checkpoint se guardó como sampler de solo inferencia en Tinker y no pudo exportarse. El repositorio ocupa 0.0 GB y solo contiene documentación y ejemplos.
- **Idioma**: solo inglés según los metadatos; no se documenta soporte multilingüe.
- **Sobreajuste temprano**: la NLL de validación empeora ligeramente a partir de la época 2 (0,4638 a 0,4645), lo que sugiere que el ajuste adicional no aporta mejoras.
- **Dataset pequeño**: 34 filas de entrenamiento y 8 de validación, con 11 sujetos 3D; la generalización a dominios 3D no vistos es incierta.
- **Riesgo de alucinación**: no evaluado en la información disponible; como modelo de código, puede generar APIs o geometrías inexistentes.
- **Licencia**: Apache 2.0 permite uso comercial, pero al no haber pesos publicados el uso comercial práctico queda limitado a la plataforma Tinker.
- **Evaluación con sesgos metodológicos**: las comparaciones ciegas se realizaron sobre 72 veredictos y 12 briefs, con tamaños muestrales reducidos; los valores p son exactos pero sobre muestras pequeñas.
- **Sesgos demográficos y culturales**: no documentados; heredados del modelo base y del corpus de entrenamiento.
- **Dependencia del agente Pi**: el comportamiento entrenado está acoplado a Pi 1.6.0, al sandbox bubblewrap y a la configuración de `prompt_template.txt`; fuera de ese entorno el rendimiento puede degradarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mike0021/inkling-mini-v1-onpolicy-pi3d
- Dataset de entrenamiento: https://huggingface.co/datasets/Mike0021/inkling-mini-v1-onpolicy-pi3d-dataset
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
