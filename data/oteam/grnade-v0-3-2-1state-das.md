# oteam/grnade-v0.3.2-1state-das

## Resumen

gRNAde es un modelo de aprendizaje profundo geométrico diseñado para el diseño inverso de secuencias de ARN a partir de una o varias conformaciones 3D de su esqueleto. Lo desarrollan originalmente Chaitanya K. Joshi, Arian R. Jamasb, Ramon Viñas y colaboradores (Universidad de Cambridge), y esta ficha concreta corresponde a una implementación no oficial publicada por el equipo OFoldX bajo el identificador `oteam/grnade-v0.3.2-1state-das`. Resuelve el problema inverso al plegamiento: dado un esqueleto de ARN con geometría conocida, propone secuencias de nucleótidos que probablemente adopten esa estructura.

El modelo combina un codificador de perceptrón vectorial geométrico (GVP) con un decodificador autorregresivo de nucleótidos. La variante v0.3.2 emplea un grafo espacial puro, sin canales de secuencia ni de pares de bases, y este checkpoint concreto está entrenado en el régimen de una sola conformación. Con 2,157 millones de parámetros, es un modelo muy compacto orientado a un dominio científico especializado, no a generación de texto general.

Su relevancia actual radica en el auge del diseño generativo de moléculas de ARN para terapias, vacunas y biología sintética, donde la predicción de secuencia a partir de estructura es un cuello de botella experimental. La licencia AGPL-3.0 y su dependencia de la librería `ofoldx` condicionan su adopción en entornos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) con decodificador autorregresivo de nucleótidos |
| Parámetros totales | 2.157.052 (2,157 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (definida por el número de nodos del grafo de la estructura de ARN de entrada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

Especificaciones internas del grafo (variante v0.3.2):

| Componente | Valor |
|---|---|
| Bloques de codificador | 4 |
| Bloques de decodificador | 4 |
| Tamaño escalar/vector de nodo | 128 / 16 |
| Tamaño escalar/vector de arista | 64 / 4 |
| Canales de arista de entrada | 131 |
| Configuración de conformaciones | 1 estado |
| Etiqueta de variante | das |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder sobre grafos geométricos. El codificador procesa el esqueleto del ARN como un grafo espacial: en la variante v0.3.2 se eliminan los canales explícitos de orden de secuencia y de pares de bases, de modo que la representación se apoya únicamente en la geometría espacial (incluyendo, según la model card, opciones de geometría de P, C4' y nitrógenos de base en la variante v1). Cada bloque GVP actualiza características escalares y vectoriales equivariantes a rotaciones, lo que permite al modelo razonar sobre orientaciones tridimensionales sin aumentar el coste de datos. El decodificador genera la secuencia de nucleótidos de forma autorregresiva, condicionada al contexto estructural codificado.

El entrenamiento se formula como recuperación autorregresiva de identidades de nucleótidos a partir del contexto estructural, con un valor de label smoothing de 0,05. La model card remite a los artículos originales para la composición exacta del corpus y la construcción de ejemplos de una y varias conformaciones; no se detallan aquí el número de tokens ni la mezcla del dataset. Este checkpoint pertenece a la familia v0.3.2 con configuración de un solo estado, lo que implica que el diseño se condiciona a una única conformación de referencia, a diferencia de las variantes de dos, tres y cinco estados. OFoldX expone un `forward` diferenciable con teacher forcing y una clase `GrnadeLoss` para entrenamiento y ajuste fino.

## Capacidades

- Diseño inverso de ARN: predice secuencias de nucleótidos que compatibilizan con un esqueleto 3D de ARN dado.
- Condicionamiento por estructura secundaria: acepta una cadena en notación dot-bracket que cubre la cadena de ARN seleccionada.
- Generación de múltiples candidatos: el pipeline permite solicitar varios diseños (`num_candidates`) y controlar la temperatura de muestreo.
- Puntuación de secuencias: cada candidato devuelve su diana molecular, el registro de diseño y las puntuaciones de secuencia.
- Soporte de estructuras multi-instancia: mediante `instance_id` cuando el fichero contiene varias cadenas de ARN.
- Equivarianza geométrica: el codificador GVP mantiene coherencia frente a rotaciones del esqueleto de entrada.
- Ajuste fino: la librería `ofoldx` expone componentes diferenciables para reentrenamiento con datos propios.
- No soporta tool calling, agentes, visión, audio ni generación de texto en lenguaje natural.

## Casos de uso

- Diseño de ARN terapéutico: dado el esqueleto cristalográfico de una diana de ARN, el modelo propone secuencias candidatas que adoptan esa geometría, que después se filtran y sintetizan en el laboratorio. Su tamaño compacto permite ejecutar muchos diseños en paralelo en una sola GPU.
- Optimización de aptámeros: partiendo de la estructura 3D de un aptámero unido a su ligando, se generan variantes de secuencia que preservan el esqueleto de unión, acelerando el cribado frente a la mutagénesis dirigida manual.
- Estabilización de ribozimas: se introduce la conformación catalítica como diana y se piden candidatos con la notación dot-bracket del centro activo, para identificar secuencias que mantengan el plegamiento funcional.
- Diseño de ARN mensajero con estructura 5' UTR controlada: se condiciona el diseño a la geometría del elemento regulador y se evalúan candidatos por sus puntuaciones de secuencia antes de la validación in vitro.
- Ajuste fino sobre un corpus propio: mediante `GrnadeLoss` y el `forward` diferenciable de OFoldX, un grupo de investigación puede reentrenar el checkpoint con estructuras de su organismo de interés y mantener el pipeline de diseño.
- Docencia y prototipado metodológico: al ser un modelo de 2,1 M de parámetros con código abierto, sirve para reproducir experimentos de aprendizaje geométrico aplicado a biología estructural en entornos con recursos limitados.
- Integración en pipelines de biología sintética: el modo por etapas del pipeline (`prepare`, `forward`, `postprocess`) permite encadenar el diseño con herramientas de plegamiento y filtros de estabilidad en un flujo automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa para los 2,157 M de parámetros; el consumo real vendrá dominado por el tamaño del grafo de la estructura de entrada y el número de candidatos generados.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090, A100 y H100; el modelo no requiere memoria de gran capacidad.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer con al menos unos pocos GB de VRAM, e incluso es viable en CPU para estructuras pequeñas.
- Opciones de despliegue: la vía prevista es la librería `ofoldx` (`pip install ofoldx`) con su pipeline `design`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gRNAde v0.3.2 1state das (esta ficha) | 2,157 M | 1 conformación, grafo espacial | Diseño inverso de ARN | AGPL-3.0 | Hugging Face (`oteam`) |
| gRNAde v1 | 2,157 M | 1 conformación, grafo con secuencia y pares de bases | Diseño inverso de ARN | AGPL-3.0 | Hugging Face (`oteam/grnade`) |
| gRNAde v0.3.2 3state das | 2,157 M | 3 conformaciones, grafo espacial | Diseño inverso multi-conformación | AGPL-3.0 | Hugging Face (`oteam`) |
| gRNAde v0.3.2 5state all | 2,157 M | 5 conformaciones, grafo espacial | Diseño inverso multi-conformación | AGPL-3.0 | Hugging Face (`oteam`) |

Las diferencias entre variantes se limitan al número de conformaciones de entrada y al conjunto de canales del grafo, no al tamaño del modelo. No se dispone de datos de rendimiento comparativo entre ellas en la información disponible.

## Limitaciones y advertencias

- Implementación no oficial: la model card la publica el equipo OFoldX, no los autores originales de gRNAde, y no ha sido revisada por ellos.
- Sesgos de dominio: el modelo se entrena con estructuras de ARN depositadas en bases de datos públicas, con el sesgo de sobrerrepresentación de ciertas familias y de estructuras resueltas experimentalmente.
- Riesgo de diseños no funcionales: las secuencias propuestas son hipótesis computacionales; requieren validación experimental y no garantizan plegamiento ni actividad in vitro.
- Configuración de un solo estado: este checkpoint no aprovecha información de conformaciones alternativas, por lo que no es adecuado para dianas que dependen de cambios conformacionales; para ello existen las variantes de 3 y 5 estados.
- Grafo espacial sin canales de secuencia ni pares de bases: la variante v0.3.2 prescinde de esas señales, lo que puede reducir el rendimiento frente a v1 en dianas donde la topología de pares es determinante.
- Restricciones de licencia: AGPL-3.0 impone obligaciones de copyleft sobre el código derivado y puede ser incompatible con productos propietarios; conviene revisar el uso comercial con asesoría legal.
- Dependencia de la librería `ofoldx`: el uso requiere instalar y mantener esa librería, y la orquestación completa de entrenamiento queda fuera del alcance del repositorio.
- Idiomas y texto: no aplica; el modelo no procesa lenguaje natural ni admite instrucciones en texto.
- Longitud de contexto: no documentada; el límite práctico lo fija el tamaño del grafo de la estructura de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/grnade-v0.3.2-1state-das
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
- Variante v0.3.2 1state all: https://huggingface.co/oteam/grnade-v0.3.2-1state-all
- Variante v0.3.2 1state multi: https://huggingface.co/oteam/grnade-v0.3.2-1state-multi
- Variante v0.3.2 2state all: https://huggingface.co/oteam/grnade-v0.3.2-2state-all
- Variante v0.3.2 3state all: https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Variante v0.3.2 3state das: https://huggingface.co/oteam/grnade-v0.3.2-3state-das
- Variante v0.3.2 3state multi: https://huggingface.co/oteam/grnade-v0.3.2-3state-multi
- Variante v0.3.2 5state all: https://huggingface.co/oteam/grnade-v0.3.2-5state-all
- Variante v0.3.2 5state das: https://huggingface.co/oteam/grnade-v0.3.2-5state-das
- Variante v0.3.2 5state multi: https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
- Código en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación de la librería: https://ofoldx.valtech.ai/
- Artículo original (arXiv): https://arxiv.org/abs/2305.14749
- Preprint sobre diseño generativo de ARN: https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Repositorio oficial: https://github.com/chaitjo/geometric-rna-design
