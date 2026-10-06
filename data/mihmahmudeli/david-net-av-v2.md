# MIHMahmudEli/david-net-av-v2

## Resumen

DAVID-Net (Disentangled Audio-Visual Deepfake Network) es un modelo multimodal de deteccion y atribucion de deepfakes desarrollado por MIHMahmudEli. A diferencia de los detectores binarios convencionales que solo devuelven una etiqueta "real" o "falso", DAVID-Net clasifica cada muestra en cuatro cuadrantes de autenticidad segun el estado de las modalidades visual y acustica: RVRA (ambas reales), RVFA (voz clonada sobre video autentico), FVRA (cara manipulada con audio real) y FVFA (ambas falsas). Esto permite atribuir *que* modalidad ha sido manipulada y localizar temporalmente la manipulacion.

El modelo se distribuye como pesos preentrenados en formato SafeTensors (~341 MB) bajo licencia MIT, junto con configuraciones de ejecucion, manifiestos de datasets y resultados de evaluacion. Esta entrenado y validado sobre el benchmark FakeAVCeleb, con evaluacion zero-shot sobre seis datasets externos adicionales (ASVspoof 2019 LA, In-the-Wild Audio, Celeb-DF v2, DFDC-10, DeepFakeTIMIT y WaveFake).

Su relevancia actual reside en el enfoque de desenredo de subespacios (subspace disentanglement), que separa caracteristicas de artefactos especificas de cada modalidad de las caracteristicas de sincronizacion cruzada. Esto le permite detectar falsificaciones duales internamente sincronizadas (FVFA) que enganarian a detectores basados unicamente en sincronia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | multimodal audio-visual con desenredo de subespacios y cabezas de decision por modalidad (detalles completos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | SafeTensors (`models/david_net_best.safetensors`, ~341 MB) |
| Tarea (pipeline) | video-classification |
| Libreria | PyTorch |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

DAVID-Net es un sistema forense multimodal que combina informacion visual (video) y acustica (audio). Su innovacion principal es un mecanismo de desenredo de subespacios que separa explicitamente las caracteristicas de artefactos propias de cada modalidad de las caracteristicas de sincronizacion entre modalidades, mediante una perdida de ortogonalidad explicita. Sobre esa representacion desenredada, el modelo aplica cabezas de decision que producen probabilidades de autenticidad por modalidad (p_v, p_a) y una distribucion conjunta sobre los cuatro cuadrantes de autenticidad.

El modelo incorpora dos capacidades adicionales destacables. Por un lado, dispone de rutas de proyeccion con token nulo (null-token projection pathways) que preservan la precision unimodal cuando una de las dos modalidades falta: alcanza un AUC de video de 0,976 con el audio silenciado y un AUC de audio de 0,999 con el video en blanco. Por otro, implementa localizacion de accion temporal (TAL), con puntuacion de anomalia visual a nivel de fotograma y localizacion de los limites de manipulacion en segmentos de habla.

Los resultados se verifican a lo largo de cinco semillas aleatorias (7, 42, 123, 456, 2024) bajo un protocolo de evaluacion con identidades disjuntas (0,0 % de solapamiento de sujetos). El repositorio incluye estudios de ablacion sobre 11 variantes arquitecturales, evaluaciones cross-dataset, metricas Leave-One-Generator-Out (LOGO), auditoria de fugas por identidad, calibracion (ECE de 15 bins), auditoria de equidad demografica y pruebas estadisticas (Wilcoxon y DeLong con correccion de Holm). No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset de entrenamiento mas alla del uso de FakeAVCeleb.

## Capacidades

- Deteccion binaria de deepfakes en video y audio de forma conjunta y por separado.
- Atribucion por modalidad: identifica si la manipulacion esta solo en el video, solo en el audio o en ambos (cuadrantes RVRA, RVFA, FVRA, FVFA).
- Tolerancia a modalidad ausente: mantiene deteccion unimodal cuando falta el audio o el video.
- Localizacion temporal (TAL): puntuacion de anomalia a nivel de fotograma y delimitacion de los limites de manipulacion en el habla.
- Clasificacion a nivel de clip y a nivel de segmento (reporta Clip AUC y AUC por modalidad).
- Calibracion de probabilidades evaluada mediante Expected Calibration Error.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles (modelo discriminativo, no generativo).
- Capacidades multilingues: no disponibles (la tarea no depende del idioma, pero no se documenta).

## Casos de uso

- Moderacion de contenido en plataformas de video: el modelo puede analizar un clip subido y determinar no solo si es falso, sino si la manipulacion afecta a la cara, a la voz o a ambas, lo que permite priorizar la revision humana segun la gravedad.
- Verificacion periodistica y fact-checking: dada una grabacion de una figura publica, el sistema puede senalar si la voz ha sido clonada sobre un video autentico, un escenario habitual en desinformacion politica.
- Analisis forense en investigacion criminal: la localizacion temporal (TAL) permite acotar los fotogramas o segmentos de habla manipulados, aportando evidencia util en un informe pericial.
- Deteccion de fraude por suplantacion de voz en atencion telefonica: usando solo la rama de audio, el modelo puede marcar intentos de voice cloning sobre llamadas o mensajes de voz grabados.
- Auditoria de contenido en redes sociales: procesado por lotes de videos para clasificar grandes volumenes y filtrar material sintetico antes de su difusion.
- Verificacion de identidad en procesos KYC: detectar si un video de prueba de vida con audio ha sido generado con avatar sintetico y voz clonada (cuadrante FVFA).
- Investigacion academica en forense digital: el repositorio ofrece manifiestos, configuraciones y resultados reproducibles que sirven de base para comparar nuevas tecnicas de deteccion.

## Benchmarks y rendimiento

| Benchmark | Video AUC | Audio AUC | Clip AUC | Notas |
|---|---|---|---|---|
| FakeAVCeleb (in-domain) | 0,977 ± 0,003 | 0,999 ± 0,002 | 0,976 ± 0,006 | Precision por cuadrante: 91,0 %; recall RVRA: 82,4 % |
| ASVspoof 2019 LA | — | 0,839 ± 0,019 | 0,839 ± 0,019 | Transferencia zero-shot solo audio |
| In-the-Wild Audio | — | 0,691 ± 0,021 | 0,691 ± 0,021 | Transferencia zero-shot solo audio |
| Celeb-DF v2 | 0,672 ± 0,014 | — | 0,672 ± 0,014 | Transferencia zero-shot solo video |
| DFDC-10 | 0,647 ± 0,020 | 0,552 ± 0,015 | 0,647 ± 0,020 | Transferencia zero-shot multimodal |
| DeepFakeTIMIT | 0,575 ± 0,021 | — | 0,575 ± 0,021 | Transferencia zero-shot solo video |
| WaveFake | — | — | 0,113 ± 0,025 | Transferencia con umbral no ajustado (DR) |

Datos adicionales de tolerancia a modalidad ausente: AUC de video de 0,976 con audio silenciado y AUC de audio de 0,999 con video en blanco.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con un repo de 0,3 GB y pesos de ~341 MB, la huella en memoria es reducida y previsiblemente inferior a 2 GB de pesos, aunque no se documenta la VRAM total necesaria incluyendo activaciones de los extractores de video y audio.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano reducido de los pesos, aunque no se confirma en la documentacion.
- Opciones de despliegue: el modelo usa PyTorch y pesos SafeTensors con un pipeline de video-classification; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos generativos, no a este detector).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos con otros detectores de deepfakes audio-visuales ni referencias a modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- El rendimiento cae de forma notable en transferencia zero-shot a datasets externos: el Clip AUC baja a 0,672 en Celeb-DF v2, 0,647 en DFDC-10 y 0,575 en DeepFakeTIMIT, muy por debajo del 0,976 in-domain sobre FakeAVCeleb.
- En WaveFake el Clip AUC es de 0,113, lo que revela una transferencia deficiente con umbral no ajustado.
- El recall del cuadrante RVRA (contenido autentico) es del 82,4 %, lo que implica que una parte de los clips autenticos puede clasificarse erroneamente.
- No se documentan los idiomas soportados, aunque la tarea se base en artefactos mas que en contenido linguistico.
- No se dispone de informacion sobre sesgos demograficos mas alla de que el repositorio incluye una auditoria de equidad (fairness_audit.csv); los resultados concretos no se detallan en la informacion disponible.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente fuera del dominio de entrenamiento.
- La licencia es MIT, lo que permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre la idoneidad para decisiones de alto riesgo.
- El numero de descargas y likes es cero en el momento de la consulta, y el repositorio no tiene aun validacion externa por parte de la comunidad.
- La model card esta parcialmente truncada en la informacion proporcionada, por lo que parte de la documentacion tecnica (por ejemplo, la carga completa de pesos) no puede verificarse.

## Enlaces

- HuggingFace: https://huggingface.co/MIHMahmudEli/david-net-av-v2
- Repositorio de codigo fuente: https://github.com/MIHMahmudEli/david-net-av-v2
