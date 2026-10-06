# MIHMahmudEli/davidnet-experiments

## Resumen

DAVID-Net (Deepfake Audio-Visual Invariant Disentanglement Network) es un modelo de detección de deepfakes audio-visuales desarrollado por MIHMahmudEli. No es un modelo generativo de lenguaje, sino un clasificador multimodal de vídeo cuya tarea es determinar la autenticidad de una secuencia que combina pista de vídeo (25 fps) y pista de audio (16 kHz), localizar temporalmente las manipulaciones y atribuir el tipo de falsificación a cada modalidad. El repositorio publicado en HuggingFace funciona como archivo persistente del proyecto: contiene 81 ejecuciones experimentales (N=3 semillas independientes sobre 27 configuraciones de ablación y benchmark) con checkpoints, curvas de evaluación y manifiestos de partición de datos.

El modelo se apoya en dos backbones preentrenados y congelados —VideoMAE para la rama visual y WavLM para la rama auditiva— sobre los que se insertan adaptadores de bajo rango (LoRA). La innovación central es la factorización desacoplada del espacio latente multimodal en tres subespacios estrictamente ortogonales, que aíslan la autenticidad de vídeo (z_v), la de audio (z_a) y la sincronización entre ambas (z_c). Sobre esa representación se montan cabezas de predicción por modalidad y una cabeza de atribución en cuatro cuadrantes (RVRA, RVFA, FVRA, FVFA).

Su relevancia actual reside en que aborda dos problemas recurrentes de los detectores de deepfakes: la degradación ante generadores no vistos durante el entrenamiento y las manipulaciones con inconsistencia entre modalidades. Publica resultados tanto en dominio (FakeAVCeleb) como de transferencia zero-shot a seis conjuntos externos, y su licencia Apache 2.0 permite uso comercial. El tamaño total del repositorio es de 764,7 GB, aunque este dato corresponde al conjunto completo de artefactos experimentales, no al peso de un único checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal de dos ramas: backbones congelados VideoMAE (video) y WavLM (audio) con adaptadores LoRA, nucleo de atencion cruzada y cabezas desacopladas (z_v, z_a, z_c) mas cabeza de atribucion en 4 cuadrantes |
| Parametros totales | no disponible (el repositorio ocupa 764,7 GB, pero corresponde a 81 ejecuciones completas, no a un unico modelo) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de video; procesa clips a 25 fps y audio a 16 kHz) |
| Tipos de cuantizacion | no disponible (los checkpoints se publican en BF16/FP32 segun la estructura del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16/FP32) |

## Arquitectura y entrenamiento

DAVID-Net es una arquitectura multimodal de dos torres. La rama de vídeo procesa la secuencia a 25 fps mediante un backbone VideoMAE congelado, mientras que la rama de audio procesa la señal a 16 kHz mediante un backbone WavLM tambien congelado. Sobre ambos backbones se aplican adaptadores de bajo rango (LoRA), de forma que el ajuste fino se concentra en un numero reducido de parametros y se preservan las representaciones preentrenadas. Las dos ramas convergen en un nucleo de atencion cruzada con factorizacion desacoplada, que proyecta la representacion fusionada en tres subespacios ortogonales: autenticidad de vídeo (z_v), autenticidad de audio (z_a) y concordancia entre modalidades (z_c). Sobre estos subespacios se situan las cabezas de prediccion P(Vídeo falso), P(Audio falso) y concordancia, ademas de una cabeza de atribucion en cuatro cuadrantes (RVRA, RVFA, FVRA, FVFA).

El entrenamiento incorpora cuatro componentes tecnicos destacables. Primero, un preentrenamiento contrastivo con conciencia de cuadrante (QACP) sobre cinco pseudo-clases agnosticas al generador, construidas exclusivamente a partir de datos pristinos (RVRA) mediante copy-synthesis con vocoder neuronal, transformaciones de auto-mezcla de vídeo e intercambios de audio entre clips. Segundo, la factorizacion desacoplada, que fuerza la ortogonalidad (z_v perpendicular a z_c y z_a perpendicular a z_c) para aislar cada fuente de evidencia. Tercero, un esquema multitarea que predice simultaneamente probabilidades calibradas por modalidad, atribucion de cuadrante e intervalos temporales de manipulacion (localizacion). Cuarto, una proyeccion de token nulo aprendible que permite ejecutar el modelo con una sola modalidad (solo audio o vídeo silencioso) sin ramificar la arquitectura. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset, mas alla de que la evaluacion en dominio usa FakeAVCeleb y que la transferencia se prueba en seis conjuntos externos.

## Capacidades

- Clasificacion de autenticidad de clips de vídeo con audio (deteccion de deepfake binaria de clip).
- Prediccion por modalidad: probabilidad de falsificacion de la pista de vídeo y de la pista de audio de forma independiente.
- Atribucion en cuatro cuadrantes (RVRA, RVFA, FVRA, FVFA) para caracterizar que modalidad esta manipulada.
- Localizacion temporal de las manipulaciones (bounding intervals) dentro del clip.
- Prediccion de concordancia entre modalidades (Sync Head, z_c) para detectar desincronizacion audio-vídeo.
- Robustez ante modalidad ausente: ejecucion con solo audio o solo vídeo silencioso gracias al token nulo aprendible.
- Explicabilidad integrada mediante la separacion en subespacios ortogonales (etiqueta explainable-ai).
- Transferencia zero-shot a generadores y conjuntos no vistos durante el entrenamiento.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso

- Deteccion de deepfakes en plataformas de vídeo: el modelo clasifica clips completos y ofrece una probabilidad de falsificacion, util como filtro previo a la moderacion manual a escala.
- Verificacion de autenticidad en medios de comunicacion: dado un vídeo de una declaracion publica, el modelo devuelve atribucion por cuadrante para saber si el fraude afecta al vídeo, al audio o a la sincronizacion.
- Forense digital y pruebas periciales: la localizacion temporal de manipulaciones permite acotar los segmentos alterados de una grabacion, no solo marcarla como falsa.
- Deteccion de audio sintetico: con la rama auditiva y el modo de modalidad unica, es aplicable a la verificacion de locuciones o grabaciones solo de voz.
- Monitorizacion de sincronizacion en pipelines de produccion audiovisual: la Sync Head detecta doblajes o montajes con desajuste entre labios y voz, reutilizable como control de calidad.
- Analisis de campanas de desinformacion: la transferencia zero-shot permite aplicar el detector a contenido generado con herramientas no vistas en entrenamiento (Celeb-DF v2, DFDC-10, entre otras).
- Investigacion en deteccion de deepfakes: el repositorio con 81 ejecuciones, manifiestos de particion y auditorias de fuga de identidad sirve como banco reproducible para comparar variantes.
- Integracion como servicio de inferencia: el autor publica una API FastAPI, por lo que puede desplegarse como endpoint de verificacion en un flujo de subida de contenido.

## Benchmarks y rendimiento

Evaluacion en dominio sobre FakeAVCeleb (N = 3 semillas independientes):

| Metrica | Resultado |
|---|---|
| AUC de deteccion de clip | 0,976 +/- 0,006 (EER: 5,8 +/- 0,8 %) |
| AUC de autenticidad de video | 0,978 +/- 0,004 (EER: 6,9 +/- 0,6 %) |
| AUC de autenticidad de audio | 0,915 +/- 0,012 (EER: 16,1 +/- 1,4 %) |
| Precision de atribucion en 4 cuadrantes | 82,1 +/- 0,9 % (Macro-F1: 0,814) |

Transferencia zero-shot entre conjuntos (AUC %):

| Conjunto | AUC |
|---|---|
| DeepFake-TIMIT (HQ) | 91,2 +/- 0,8 % |
| Celeb-DF v2 | 83,6 +/- 1,2 % |
| WaveFake | 79,3 +/- 1,1 % |
| DFDC-10 | 78,4 +/- 0,9 % |
| ASVspoof 2019 LA | 76,8 +/- 1,5 % |
| In-the-Wild (mundo real) | 74,5 +/- 1,4 % |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita. Depende del tamano concreto de los backbones VideoMAE y WavLM empleados (no especificado) y de si se ejecutan ambas ramas o una sola.
- GPU recomendadas: no disponible. La inferencia de dos backbones congelados con adaptadores LoRA es viable en GPUs de gama media-alta, pero no se aportan cifras de latencia ni de throughput.
- Compatibilidad con GPU de consumo: probable si el backbone visual y el auditivo son de tamano base; no confirmado en la informacion disponible.
- Opciones de despliegue: el autor publica una API de inferencia basada en FastAPI (Render) y una demo web (Vercel). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son motores orientados a modelos de lenguaje y no aplican a este clasificador.
- Carga de checkpoints: mediante PyTorch y la libreria safetensors, descargando los pesos con huggingface_hub (se muestra un fragmento de codigo de inicio rapido en la model card).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos comparables, por lo que no es posible una comparacion numerica rigurosa. La categoria de referencia son los detectores de deepfakes audio-visuales que operan sobre pares vídeo-audio, como las lineas de trabajo basadas en AVoiD-DF o en deteccion conjunta de audio y vídeo. Para una comparacion fiable habria que contrastar AUC, EER y capacidad de atribucion por modalidad sobre los mismos conjuntos (FakeAVCeleb, Celeb-DF v2, DFDC), datos que no se incluyen aqui.

| Aspecto | DAVID-Net | Alternativas audio-visuales |
|---|---|---|
| Parametros | no disponible | no disponible |
| Longitud de contexto / ventana | no disponible | no disponible |
| Rendimiento (AUC en dominio) | 0,976 (deteccion de clip) | no disponible |
| Transferencia zero-shot | 74,5-91,2 % segun conjunto | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Disponibilidad | Repositorio HuggingFace, GitHub y API publica | no disponible |

## Limitaciones y advertencias

- Sesgos: pueden aparecer sesgos derivados de los datasets de entrenamiento y evaluacion (FakeAVCeleb, Celeb-DF v2, DFDC, etc.), que no representan por igual a todos los grupos demograficos ni condiciones de grabacion.
- Alucinacion y falsos positivos: como clasificador, puede producir falsos positivos y falsos negativos. La rama de audio es la mas debil (AUC 0,915 frente a 0,978 del vídeo), por lo que la atribucion basada en audio es menos fiable.
- Degradacion fuera de dominio: el rendimiento cae de forma notable en transferencia zero-shot (74,5 % en escenarios del mundo real), lo que desaconseja su uso sin recalibracion en dominios alejados del entrenamiento.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni condiciones de idioma; no se garantiza comportamiento uniforme entre lenguas y acentos.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones de las fuentes de datos y de los conjuntos de evaluacion utilizados, que pueden tener sus propias restricciones.
- Caveat de despliegue: el repositorio es un archivo de experimentos de 764,7 GB con 81 ejecuciones; no es un paquete optimizado para produccion. Hay que seleccionar el checkpoint concreto (por ejemplo, el mejor de una configuracion) y verificar su config.json e hiperparametros.
- Disponibilidad de datos de hardware: la ausencia de cifras de VRAM, latencia y throughput obliga a medir en el entorno de destino antes de dimensionar el despliegue.
- Estado del proyecto: pocas descargas y me gusta en el momento de la consulta, y metadatos con fechas de 2026; conviene verificar el estado real del repositorio y la vigencia de la API antes de depender de el.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MIHMahmudEli/davidnet-experiments
- Repositorio de codigo (GitHub): https://github.com/MIHMahmudEli/david-net-av-v2
- Demo web (Vercel): https://david-net-av.vercel.app/
- API de inferencia (FastAPI en Render): https://davidnet-api.onrender.com/health
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
