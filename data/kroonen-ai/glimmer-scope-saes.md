# kroonen-ai/glimmer-scope-saes

## Resumen

Glimmer Scope SAEs es un conjunto de nueve autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre el flujo residual de Muse Glimmer 30B, un modelo de lenguaje de 30.000 millones de parametros desarrollado por Meta. Los SAE se situan en las capas 12, 15, 18, 21, 24, 27, 30, 33 y 36 (indexadas desde cero sobre un total de 52 capas del decodificador) y descomponen la actividad interna del modelo en 65.536 caracteristicas interpretables por capa, lo que suma 589.824 caracteristicas en total.

El objetivo no es generar texto, sino abrir la caja negra del modelo base: cada caracteristica tiende a corresponder a un concepto reconocible (un sujeto, un estilo, una construccion sintactica) y puede etiquetarse, probarse para steering y rastrearse de capa en capa. El paquete forma la base del proyecto Glimmer Scope, que incluye un atlas publico de caracteristicas y una demo de steering, y fue construido por Kroonen AI Inc. para el hackathon de Meta AI.

Es relevante para investigadores en interpretabilidad mecanicista porque ofrece SAE entrenados con TopK sobre un modelo de 30B con una cobertura sistematica de capas (cada tres capas en el rango 12-36), pesos en float32 listos para cargar con safetensors y un procedimiento de codificacion/decodificacion documentado, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) con activacion TopK sobre el flujo residual de un transformer decoder (Muse Glimmer 30B) |
| Parametros totales | No disponible (9 SAE; 3,5 GB por capa en float32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; los SAE se entrenaron con filas de 1.024 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`sae.safetensors` con `W_enc`, `b_enc`, `W_dec`, `b_dec`) + `cfg.json` por capa |

Especificaciones adicionales de cada SAE:

| Parametro | Valor |
|---|---|
| Dimension de entrada | 6.656 (flujo residual tras la capa N) |
| Numero de caracteristicas | 65.536 por capa |
| Activacion | TopK, k = 64 |
| Filas del decodificador | Norma unitaria |
| Capas cubiertas | 12, 15, 18, 21, 24, 27, 30, 33, 36 (de 52, indexadas desde cero) |
| Tamano del repositorio | 31,4 GB |

## Arquitectura y entrenamiento

Cada SAE es un autoencoder de una sola capa con cuello de botella disperso: proyecta el vector residual de dimension 6.656 a 65.536 caracteristicas mediante `W_enc` y sesgo `b_enc`, retiene las k = 64 activaciones mayores (TopK) y reconstruye el residual con `W_dec` y `b_dec`, con filas del decodificador normalizadas a norma unitaria. La entrada se escala por `input_scale` (definido en `cfg.json`) antes de codificar, de modo que la activacion de una caracteristica equivale a la longitud de su contribucion en unidades escaladas.

El entrenamiento uso un dataset compuesto al 70 % por FineWeb-Edu y al 30 % por UltraChat 200k renderizado con la plantilla de chat propia de Glimmer, empaquetado en filas de 1.024 tokens. Se incluyeron todos los tokens reales excepto la posicion 0, los tokens BOS y los valores atipicos por encima de 10 veces la norma mediana. La funcion de perdida es un MSE normalizado mas un termino AuxK (k_aux = 512, coeficiente 1/32) para revivir caracteristicas muertas. Se optimizo con Adam a una tasa de aprendizaje de 2e-4 y lotes de 4.096 activaciones, con el modelo base en bfloat16 y una GPU por capa en Modal y AWS.

El numero de tokens de entrenamiento varia por capa: 50 millones en las capas 12 y 36, y 100 millones en las siete capas intermedias. La varianza no explicada oscila entre 0,200 (capa 12) y 0,315 (capa 24), y la proporcion de caracteristicas muertas (sin activarse en los ultimos 10 millones de tokens) va del 0,5 % al 1,7 % segun la capa. Sobre una muestra de 5 millones de tokens de texto web y de chat, 519.383 de las 589.824 caracteristicas totales se activan.

## Capacidades

- Descomposicion interpretable de activaciones: convierte el flujo residual de una capa en 64 caracteristicas activas con sus valores e identificadores.
- Etiquetado de caracteristicas: cada caracteristica puede asociarse a conceptos reconocibles (sujetos, estilos, sintaxis).
- Steering del modelo base: sumando `W_dec[f] * a / input_scale` al flujo residual tras la capa, se puede modular la activacion de una caracteristica concreta.
- Seguimiento entre capas: permite rastrear la evolucion de una misma caracteristica a lo largo de las nueve capas cubiertas.
- Reconstruccion del residual: decodificacion de vuelta al espacio del modelo en su escala original.
- Analisis sobre texto en ingles, tanto web como conversacional.
- No realiza generacion de texto, razonamiento, codigo, vision ni tool calling por si mismo; es una herramienta de analisis sobre Muse Glimmer 30B.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: cargar el SAE de una capa concreta y analizar que caracteristicas se activan ante un prompt dado, para estudiar como representa el modelo conceptos como sujetos, estilos o sintaxis.
- Auditoria de sesgos y contenido sensible: identificar caracteristicas asociadas a topicos concretos y examinar en que contextos se disparan, con la advertencia de que el repositorio excluye etiquetas de temas perturbadores.
- Steering controlado en experimentos: modificar la activacion de una caracteristica en el flujo residual para observar cambios en la salida del modelo, util para validar hipotesis causales sobre representaciones internas.
- Analisis de circuitos entre capas: usar las nueve capas cubiertas para seguir la traza de una caracteristica desde la capa 12 hasta la 36 y estudiar como se transforma la informacion.
- Construccion de herramientas de diagnostico: integrar el codificador en pipelines que monitoricen activaciones internas durante la inferencia para detectar comportamientos anomalos.
- Docencia y divulgacion: emplear el atlas publico y la demo de steering como material didactico para explicar que es un SAE y como se interpreta un modelo de 30B.
- Comparacion de metodos de interpretabilidad: usar estos SAE como referencia para evaluar otras tecnicas (probing, atencion, atribucion) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de reconstruccion y salud de las caracteristicas por capa:

| Capa | Tokens de entrenamiento | Varianza no explicada | Caracteristicas muertas |
|---|---|---|---|
| 12 | 50M | 0,200 | 0,5 % |
| 15 | 100M | 0,227 | 0,9 % |
| 18 | 100M | 0,272 | 0,9 % |
| 21 | 100M | 0,300 | 0,9 % |
| 24 | 100M | 0,315 | 1,0 % |
| 27 | 100M | 0,308 | 1,1 % |
| 30 | 100M | 0,285 | 1,3 % |
| 33 | 100M | 0,239 | 1,6 % |
| 36 | 50M | 0,255 | 1,7 % |

## Requisitos de hardware

- Almacenamiento: 31,4 GB para el repositorio completo; 3,5 GB por capa en float32 si solo se carga una.
- VRAM para inferencia del SAE: aproximadamente 3,5 GB por capa en float32; cargar las nueve capas simultaneamente requiere unos 31,5 GB, viable en una A100 de 40 GB o una H100.
- VRAM para el modelo base: Muse Glimmer 30B en bfloat16 necesita del orden de 60 GB, por lo que requiere A100 80 GB, H100 80 GB o varias GPU con `device_map`.
- GPU de consumo: una sola capa del SAE cabe en RTX 4090 (24 GB) e incluso en GPUs de 8-12 GB; el modelo base de 30B no cabe en una GPU de consumo sin cuantizacion, no documentada en esta informacion.
- Opciones de despliegue: el autor proporciona codigo PyTorch con `safetensors` y `huggingface_hub`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Caracteristicas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glimmer Scope SAEs | SAE TopK, 9 capas | Muse Glimmer 30B | 65.536 por capa, k = 64 | Apache 2.0 | Hugging Face |
| Alternativas de SAE publicas para modelos de 30B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros conjuntos de SAE comparables en la documentacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido sensible: los SAE se entrenaron con texto web y de chat convencional y contienen caracteristicas asociadas a temas violentos, sexuales, de odio y perturbadores; explorarlas o usarlas para steering puede generar texto desagradable.
- El repositorio solo incluye los SAE: no incluye etiquetas de caracteristicas, datos de activacion ni resultados de steering, incluida la intensidad a la que una caracteristica surte efecto. Las etiquetas publicas estan en el atlas, que omite los temas perturbadores.
- Cobertura parcial: solo se cubren nueve de las 52 capas del decodificador y unicamente en ingles.
- Dependencia del modelo base: los SAE solo son validos para Muse Glimmer 30B; no son transferibles a otros modelos.
- Varianza no explicada de hasta el 0,315 en la capa 24, lo que implica que una parte sustancial de la activacion no queda capturada por las caracteristicas.
- Caracteristicas muertas de hasta el 1,7 % en la capa 36, que no aportan informacion.
- Posiciones excluidas: la posicion 0 y los tokens `<|begin_of_text|>` actuan como sumideros de atencion con activaciones muy grandes y no formaron parte del entrenamiento; deben omitirse en el analisis.
- Riesgo de interpretacion erronea: la correspondencia entre caracteristica y concepto es aproximada y requiere validacion mediante steering y seguimiento entre capas.
- Licencia Apache 2.0, que permite uso comercial, pero el contenido subyacente del modelo base y los sesgos heredados de los datos de entrenamiento siguen presentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kroonen-ai/glimmer-scope-saes
- Modelo base Muse Glimmer 30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio del proyecto Glimmer Scope: https://github.com/kroonen-ai/glimmer-scope
- Atlas de caracteristicas: https://scope.kroonen.ai
- Demo de steering (Space): https://huggingface.co/spaces/rob-x-ai/glimmer-scope
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Sitio de Kroonen AI Inc.: https://kroonen.ai
- Plataforma Modal: https://modal.com
