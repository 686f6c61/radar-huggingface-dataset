# anonboltzinterp/Boltz1-SAEs-L2-rec0

## Resumen

Este repositorio contiene un conjunto de autoencoders dispersos (SAEs) de tipo TopK entrenados sobre las activaciones del tronco Pairformer del modelo Boltz-1, específicamente en la iteración de reciclado 0 (la primera pasada del tronco, antes de que cualquier estado estructural reciclado se realimente). El trabajo se publica para revisión anónima por pares, sin autoría ni afiliación adjunta al repositorio, y forma parte de un análisis más amplio de interpretabilidad mecánica del plegamiento de proteínas.

El conjunto incluye 75 ejecuciones de entrenamiento: 25 capas (índices pares 0-46 más la capa 47) multiplicadas por 3 semillas aleatorias. Cada ejecución contiene los pesos del checkpoint, la configuración de hiperparámetros, el vector de medias para preprocesamiento y métricas de evaluación. La relevancia de este recurso radica en que permite analizar cómo el tronco Pairformer de Boltz-1 representa información biológica en su primera pasada, antes del refinamiento por reciclado, lo que resulta útil para investigar qué características estructurales y evolutivas se codifican en cada capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TopK sparse autoencoder (k = 256) |
| Parametros totales | no disponible (latent width 2048, input width 384) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, formato PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt), config.json, mean_vector.npy |

## Arquitectura y entrenamiento

Los SAEs son autoencoders dispersos con activación TopK, donde solo las k = 256 neuronas latentes con mayor activación se mantienen por paso. La anchura del espacio latente es de 2048 dimensiones, y la entrada tiene 384 dimensiones (la dimensión del tronco Pairformer de Boltz-1). El preprocesamiento consiste en restar la media del conjunto de entrenamiento antes de la codificación, y el decodificador está normalizado a norma unitaria. La regularización L2 sobre los pesos se fijó en 3e-3.

El entrenamiento se realizó durante 500.000 pasos con 3 semillas diferentes por capa, lo que permite evaluar la estabilidad de los features aprendidos. Los datos de entrenamiento provienen de las activaciones del tronco Pairformer de Boltz-1 en su iteración de reciclado 0, es decir, la primera pasada del tronco antes de que se realimente información estructural reciclada. No se especifica el número total de tokens o muestras de entrenamiento, ni si se usó RLHF o DPO (no aplica a este tipo de modelo).

## Capacidades

- Análisis de interpretabilidad mecánica: permite identificar qué features biológicos se codifican en cada capa del tronco Pairformer de Boltz-1.
- Comparación entre iteraciones de reciclado: al existir un repositorio gemelo para recycle 1, se pueden comparar las representaciones entre la primera pasada y las pasadas recicladas.
- Extracción de features dispersos: las activaciones latentes dispersas (k = 256 de 2048) facilitan el análisis de qué dimensiones se activan ante diferentes entradas.
- Reproducibilidad: cada ejecución incluye su configuración completa de hiperparámetros y semillas, lo que permite reproducir el entrenamiento.
- Compatibilidad con herramientas de interpretabilidad: los checkpoints en formato PyTorch son directamente cargables con bibliotecas estándar de SAE (como SAELens).
- Análisis por capas: las 25 capas cubren todo el tronco Pairformer, permitiendo estudios de evolución de features a lo largo de la profundidad.

## Casos de uso

- Investigación en biología estructural: los SAEs permiten identificar qué features de secuencia y estructura se codifican en el tronco Pairformer, ayudando a entender cómo Boltz-1 representa información biológica.
- Estudio de la dinámica del reciclado: comparando las activaciones entre recycle 0 y recycle 1, se puede analizar cómo el reciclado refina las representaciones internas.
- Desarrollo de métodos de interpretabilidad: este conjunto de SAEs sirve como banco de pruebas para nuevos métodos de análisis de features en modelos de plegamiento de proteínas.
- Análisis de features superpuestos: la dispersión TopK permite estudiar la polisemia de las neuronas latentes y cómo se combinan para representar conceptos biológicos complejos.
- Evaluación de la estabilidad del entrenamiento: las 3 semillas por capa permiten medir la varianza de los features aprendidos y su robustez.
- Comparación con otros modelos de plegamiento: las activaciones del tronco pueden compararse con las de AlphaFold3 o Chai-1 si se entrenan SAEs equivalentes sobre esos modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento del modelo base Boltz-1 ni comparaciones con otros SAEs. Los archivos `eval_step_500000.json` y `stats.jsonl` contienen métricas de entrenamiento, pero su contenido no se detalla en la documentación proporcionada.

## Requisitos de hardware

- Tamaño del repositorio: 1.4 GB en total, lo que implica que cada checkpoint individual es relativamente pequeño (aproximadamente 18 MB por ejecución, dado que hay 75 ejecuciones).
- VRAM estimada para inferencia: muy baja, del orden de 1-2 GB, ya que cada SAE es una red pequeña (384 → 2048 → 384) que procesa activaciones individuales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso CPU es viable para inferencia por lotes pequeños.
- No requiere GPU de alta gama: cabe en cualquier GPU de consumo (GTX 1060, RTX 3060, etc.).
- Opciones de despliegue: carga directa con PyTorch; no requiere vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponible, pero se espera que sea muy rápido dado el tamaño reducido de la red.

## Comparativa con modelos similares

| Modelo | Tipo | Capas | Semillas | Reciclado | Repo |
|---|---|---|---|---|---|
| Boltz1-SAEs-L2-rec0 (este) | TopK SAE, k=256, lat 2048 | 25 | 3 | 0 | anonboltzinterp/Boltz1-SAEs-L2-rec0 |
| Boltz1-SAEs-L2-rec1 | TopK SAE, k=256, lat 2048 | 25 | 3 | 1 | anonboltzinterp/Boltz1-SAEs-L2-rec1 |
| Boltz1-SAEs-L2-Diffusion | TopK SAE sobre módulo de difusión | no disponible | no disponible | no aplica | anonboltzinterp/Boltz1-SAEs-L2-Diffusion |

Los tres repositorios son complementarios y cubren diferentes partes del modelo Boltz-1. No se dispone de otros SAEs públicos entrenados sobre modelos de plegamiento de proteínas para una comparación más amplia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse sobre Boltz-1, hereda cualquier sesgo presente en los datos de entrenamiento de dicho modelo.
- Riesgo de alucinación: no aplica directamente, ya que no es un modelo generativo; sin embargo, los features aprendidos pueden no corresponder a conceptos biológicos reales si el entrenamiento no fue suficientemente diverso.
- Limitaciones de contexto o idioma: no aplica, al no ser un modelo de lenguaje.
- Restricciones de licencia: la licencia no está especificada en el repositorio, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de usar en producción.
- Advertencia de caché: los nombres de archivo son idénticos entre los repositorios de recycle 0 y recycle 1, por lo que si se descargan ambos, deben almacenarse en directorios separados para evitar que la caché de HuggingFace sirva pesos incorrectos.
- Naturaleza anónima: el repositorio se publica para revisión a ciegas, por lo que no hay información de contacto ni garantías de mantenimiento futuro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anonboltzinterp/Boltz1-SAEs-L2-rec0
- Repositorio companion recycle 1: https://huggingface.co/anonboltzinterp/Boltz1-SAEs-L2-rec1
- Repositorio companion diffusion: https://huggingface.co/anonboltzinterp/Boltz1-SAEs-L2-Diffusion
- Repositorio espejo (evolve-away): https://huggingface.co/evolve-away/Boltz1-SAEs-L2-rec0
- Repositorio oficial de Boltz-1: https://github.com/jwohlwend/boltz
- Sitio web de Boltz: https://boltz.bio/
- Repositorio del proyecto (Usertaura): https://github.com/Usertaura/boltzProject
