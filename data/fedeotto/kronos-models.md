# fedeotto/kronos-models

# Kronos

## Resumen

Kronos es una familia de modelos de difusion latente autorregresiva para la generacion de moleculas en 3D, publicada por Federico Ottomano y colaboradores (Ren, Li, Jelfs y Ganose) y distribuida como checkpoints en el repositorio `fedeotto/kronos-models`. El modelo no opera sobre texto ni sobre representaciones 1D (SMILES), sino que genera directamente coordenadas atomicas tridimensionales, lo que lo situa en la categoria de modelos generativos de estructuras moleculares 3D.

El sistema se compone de dos piezas: un autoencoder unificado (UAE) que comprime las moleculas a un espacio latente continuo, y un modelo autorregresivo que modela secuencias de tokens latentes y las decodifica mediante difusion. Se publican dos variantes del autoencoder, entrenadas sobre QM9 y GEOM-Drugs respectivamente, y ocho configuraciones del generador por cada dataset, que cubren una ablacion de escalado en profundidad (8, 10, 12, 16 capas), numero de cabezas (8 a 16) y dimension del modelo (512 a 1024).

El checkpoint principal, `layers16-heads16-d1024`, tiene 283 M de parametros y es el que se reporta en el articulo "Autoregressive latent diffusion for 3D molecule generation" (arXiv:2607.09277). El repositorio ocupa 11 GB y se distribuye bajo licencia MIT, aunque en el momento de redactar esta ficha no acumula descargas ni valoraciones en HuggingFace, por lo que se trata de una publicacion reciente y todavia no validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente autorregresiva sobre un autoencoder unificado (UAE) que define el espacio latente |
| Parametros totales | 283 M en el checkpoint principal `layers16-heads16-d1024`; no disponible para las variantes de ablacion (8, 10, 12 capas; d=512, 640, 768) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; el modelo opera sobre secuencias de tokens latentes de moleculas) |
| Tipos de cuantizacion | No disponible; los checkpoints se distribuyen en precision de entrenamiento (`.ckpt` de PyTorch Lightning) |
| Idiomas soportados | No disponible (modelo especifico de quimica; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch Lightning (`.ckpt`), mas ficheros `.pth` con estadisticas del espacio latente (`latent_stats.pth`) |
| Datasets de entrenamiento | QM9 y GEOM-Drugs (referenciados como `fedeotto/kronos-datasets`) |
| Variantes publicadas | `kronos-{qm9,geom}-layers{8,10,12,16}-heads{8,10,12,16}-d{512,640,768,1024}` |
| Autoencoders incluidos | `uae_qm9/last.ckpt`, `uae_geom/last.ckpt` (con sus respectivos `latent_stats.pth`) |
| Tamano del repositorio | 11,0 GB |
| Sampler de inferencia | DDIM (`--sampler ddim`) |
| Entrada / salida | Espacio latente de moleculas / coordenadas atomicas 3D |
| Fecha de publicacion | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

Kronos sigue un esquema de difusion en espacio latente en dos etapas. En la primera, un autoencoder unificado (UAE) aprende a comprimir moleculas 3D a un espacio latente continuo, y se guardan estadisticas del latente (`latent_stats.pth`) que se usan para normalizarlo. En la segunda, un transformer autorregresivo modela la distribucion de las secuencias latentes y el proceso de difusion genera cada token latente condicionado en los anteriores. Esta combinacion de autoregresion sobre latentes y decodificacion por difusion es la innovacion central que da titulo al articulo.

Los checkpoints se publican por separado para QM9 (moleculas pequenas, hasta 9 atomos pesados) y GEOM-Drugs (moleculas tipo farmaco, de mayor tamano), de modo que el espacio latente y el generador no son intercambiables entre dominios. El repositorio incluye, ademas del modelo principal de 283 M de parametros, tres configuraciones mas pequenas que constituyen el estudio de escalado (ablacion de profundidad, anchura y numero de cabezas), un recurso poco habitual y util para reproducir analisis de leyes de escalado en generacion molecular.

No se dispone, en la informacion proporcionada, del numero de tokens o moleculas usadas en el preentrenamiento, ni de la composicion exacta del dataset mas alla de las dos fuentes citadas. Tampoco hay constancia de etapas de ajuste por preferencias humanas (RLHF/DPO), algo que no aplica en este dominio; el ajuste relevante seria, en su caso, fine-tuning condicionado por propiedades quimicas, que la model card no documenta.

## Capacidades

- Generacion de moleculas 3D completas: produce coordenadas atomicas tridimensionales coherentes a partir de muestreo del espacio latente.
- Generacion incondicional a escala de lote: el ejemplo oficial de la model card genera 10.000 muestras en una sola invocacion.
- Muestreo con sampler DDIM, lo que permite controlar el numero de pasos de denoising y, por tanto, el compromiso entre calidad y coste computacional.
- Dos dominios quimicos cubiertos: moleculas pequenas (QM9) y moleculas tipo farmaco (GEOM-Drugs), con checkpoints especificos por dominio.
- Escalado configurable: cuatro tamanos de profundidad, cuatro de anchura y cuatro de cabezas, utiles para estudiar el efecto del tamano en la calidad generativa.
- Representacion latente reutilizable: el UAE y las estadisticas latentes permiten trabajar en el espacio comprimido, no solo en coordenadas cartesianas.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de proposito general ni un agente.
- No soporta entrada o salida de texto, vision, audio ni codigo.

## Casos de uso

- Generacion de conformeros para cribado virtual: dado un espacio quimico de interes, se muestrean miles de estructuras 3D que pueden usarse como punto de partida en docking o en estimacion de afinidad, evitando depender de conformeros generados por reglas geometricas.
- Aumento de datos para modelos de prediccion de propiedades: las muestras 3D generadas amplian los conjuntos de entrenamiento de modelos de energia y fuerza (ML potentials) o de predictores de propiedades cuanticas, especialmente en regimenes con pocos datos etiquetados.
- Descubrimiento de farmacos en fase temprana: con los checkpoints de GEOM-Drugs, el modelo genera estructuras del rango de tamano relevante para farmacos, utilizables como hipotesis iniciales en campanas de hit finding.
- Investigacion metodologica sobre difusion latente: la publicacion incluye variantes de ablacion, lo que permite reproducir experimentos de escalado y comparar autoregresion latente frente a difusion pura en el mismo espacio latente.
- Benchmarking reproducible de generacion 3D: el repositorio documenta el comando exacto de evaluacion (`python -m kronos.scripts.test ... --num_samples 10000 --sampler ddim`), lo que facilita comparaciones controladas entre metodos bajo un mismo protocolo de muestreo.
- Generacion de datos sinteticos para simulacion molecular: estructuras 3D plausibles para inicializar dinamica molecular o calculos de quimica cuantica antes de la optimizacion de geometria.
- Docencia y prototipado en quimica computacional: al ser codigo y pesos abiertos con licencia MIT, sirve como banco de pruebas para cursos y proyectos que necesiten un generador molecular 3D funcional sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de metricas (validez, unicidad, error de geometria, estabilidad) y los resultados de busqueda recuperados no corresponden a este modelo. Cualquier cifra de rendimiento deberia obtenerse ejecutando la evaluacion incluida en el repositorio de codigo sobre los checkpoints publicados.

## Requisitos de hardware

- VRAM estimada para el generador principal (283 M de parametros): aproximadamente 1,1 GB en fp32 y 0,6 GB en bf16/fp16 solo para los pesos; hay que sumar los pesos del UAE y las activaciones, no cuantificadas en la informacion disponible.
- Al tratarse de un modelo de menos de 300 M de parametros y sin ventana de contexto extensa, es previsible que quepa en GPU de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) con margen holgado, si bien el autor no publica requisitos oficiales.
- GPU de centro de datos (A100, H100) recomendables solo si se busca maximizar el throughput de muestreo a gran escala (decenas de miles de moleculas).
- Es posible que la generacion funcione en CPU, pero no hay datos de latencia ni de throughput en la informacion proporcionada.
- Opciones de despliegue: el repositorio oficial esta pensado para PyTorch y PyTorch Lightning, invocado como modulo (`python -m kronos.scripts.test`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este caso.
- Restriccion operativa relevante: los checkpoints guardan internamente la ruta `vae_path = checkpoints/uae_{qm9,geom}/last.ckpt`, por lo que la estructura de directorios `checkpoints/` debe preservarse exactamente o la carga fallara.
- El repositorio completo ocupa 11 GB, de modo que conviene descargar solo las variantes necesarias en lugar del conjunto completo.

## Comparativa con modelos similares

| Modelo | Enfoque | Dominios evaluados | Parametros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kronos | Difusion latente autorregresiva sobre autoencoder unificado | QM9, GEOM-Drugs | 283 M (modelo principal) | No aplica | MIT | Pesos y codigo abiertos |
| EDM (equivariant diffusion) | Difusion en coordenadas 3D con equivariancia | QM9, GEOM-Drugs | No disponible | No aplica | No disponible | Codigo abierto |
| GeoLDM | Difusion latente sobre un autoencoder equivariante | QM9, GEOM-Drugs | No disponible | No aplica | No disponible | Codigo abierto |
| MiDi | Difusion sobre representacion conjunta de ligando y bolsillo | GEOM-Drugs, CrossDocked | No disponible | No aplica | No disponible | Codigo abierto |

Nota: los datos de la columna "enfoque" y "dominios" de los modelos alternativos proceden de conocimiento general del area y no de la informacion proporcionada en esta busqueda; los valores numericos no se incluyen porque no se han verificado. Para una comparacion cuantitativa fiable hay que consultar el articulo arXiv:2607.09277.

## Limitaciones y advertencias

- Riesgo de estructuras quimicamente invalidas o energeticamente inestables: al ser un modelo generativo en 3D sin verificacion explicita de valencias, las muestras deben filtrarse con herramientas de quimica antes de usarse en produccion.
- Sin validacion externa: el repositorio registra 0 descargas y 0 valoraciones, y no incluye metricas de calidad; no hay evidencia independiente de su rendimiento.
- Sesgo de dominio: los modelos estan entrenados sobre QM9 y GEOM-Drugs, por lo que el espacio quimico cubierto es acotado (moleculas pequenas y farmacos de tamano moderado). No se debe esperar buen comportamiento en proteinas, materiales inorganicos o moleculas muy grandes.
- Alucinacion en sentido quimico: el modelo puede generar geometrias plausibles a nivel de coordenadas pero con propiedades fisicoquimicas irreales; no debe interpretarse la salida como una molecula sintetizable.
- Compatibilidad de checkpoints: los pesos no son intercambiables entre dominios ni entre configuraciones de tamano, y la ruta interna al autoencoder obliga a respetar la estructura de directorios.
- Formato de pesos: son checkpoints de PyTorch Lightning (`.ckpt`), no safetensors ni GGUF, lo que complica su carga en runtimes alternativos y requiere el codigo del autor.
- Licencia: el modelo se distribuye bajo MIT, lo que permite uso comercial, pero la licencia de los datasets de origen (QM9 y GEOM-Drugs) debe verificarse por separado antes de un uso comercial del modelo entrenado.
- Ausencia de documentacion sobre datos de entrenamiento: no se especifica el numero de moleculas ni los criterios de filtrado, lo que limita la trazabilidad y la reproducibilidad.
- Colision de nombres: existe otro proyecto llamado Kronos, un modelo fundacional para series temporales financieras (K-lines), sin relacion alguna con este modelo. Los resultados de busqueda web recuperados corresponden a ese otro proyecto y no deben atribuirse a este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/fedeotto/kronos-models
- Dataset asociado: https://huggingface.co/datasets/fedeotto/kronos-datasets
- Repositorio de codigo: https://github.com/fedeotto/kronos
- Articulo: arXiv:2607.09277, "Autoregressive latent diffusion for 3D molecule generation" (Ottomano, Ren, Li, Jelfs, Ganose, 2026)
- Version PDF del articulo: no disponible en los resultados de busqueda (solo se dispone del identificador arXiv)
- Demo: no disponible
- Aviso: las entradas de busqueda sobre "Kronos" en GitHub y arXiv (por ejemplo https://arxiv.org/pdf/2508.02739 y https://github.com/thzll2001/Kronos-ai) corresponden a un modelo fundacional de mercados financieros distinto, sin relacion con este repositorio.
