# Anbeeld/Alpamayo-R1-10B-DFlash-GGUF

## Resumen

Alpamayo-R1-10B-DFlash-GGUF es una cuantización en formato GGUF del modelo de borrador (draft model) DFlash desarrollado por el laboratorio z-lab para acelerar la inferencia del modelo Alpamayo-R1-10B de NVIDIA, un modelo vision-language-action (VLA) orientado a conducción autónoma. Este repositorio, publicado por Anbeeld, no contiene un modelo de lenguaje independiente, sino un componente auxiliar diseñado para ser utilizado dentro del pipeline FlashDrive, que implementa decodificación especulativa basada en difusión por bloques (block diffusion).

El modelo DFlash es una red ligera de 2 capas con arquitectura estilo Qwen3, con un tamaño de bloque de 8 tokens, que propone varios tokens en paralelo para que el modelo objetivo los verifique en una única pasada hacia adelante. Su relevancia radica en que permite reducir la latencia de razonamiento del modelo Alpamayo-R1-10B sin alterar su distribución de salida, lo que resulta crítico en aplicaciones de conducción autónoma en tiempo real. La cuantización GGUF facilita su despliegue en entornos con recursos limitados mediante el fork BeeLlama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-style, 2 capas transformer, attention por grupos (GQA) con 32 cabezas de consulta y 8 de clave/valor, tamaño oculto 4096, FFN intermedio 12288 |
| Parametros totales | 469.787.136 (aproximadamente 469 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas en la informacion disponible) |
| Idiomas soportados | Ingles (segun etiqueta 'en') |
| Licencia | NVIDIA License (uso no comercial exclusivamente, se extiende a obras derivadas) |
| Formato de pesos | GGUF (tambien safetensors en el checkpoint original) |

## Arquitectura y entrenamiento

El modelo DFlash es un borrador de decodificacion especulativa basado en difusion por bloques. A diferencia de los modelos de lenguaje convencionales, no genera texto de forma autoregresiva completa, sino que propone bloques de 8 tokens en paralelo, condicionados a los estados ocultos del modelo objetivo Alpamayo-R1-10B, concretamente de las capas 24, 30, 31, 32 y 34. La arquitectura es una red de 2 capas tipo Qwen3 con atencion por grupos (GQA: 32 cabezas de consulta, 8 de clave/valor), tamano oculto de 4096 y FFN intermedio de 12288. El checkpoint incluye ademas un embedding de mascara entrenado (`mask_embedding.pt`) que FlashDrive anade a la tabla de embeddings del modelo objetivo.

El entrenamiento sigue el enfoque DFlash presentado en ICML 2026, que utiliza difusion por bloques para acelerar la inferencia. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el numero de tokens utilizados. El modelo se deriva de los pesos de Alpamayo-R1-10B de NVIDIA, por lo que la licencia no comercial se aplica a esta obra derivada. El codigo de inferencia FlashDrive se distribuye por separado bajo licencia MIT.

## Capacidades

- No es un modelo de lenguaje autonomo: no puede generar texto ni mantener conversaciones por si solo.
- Funciona exclusivamente como modelo de borrador (draft) dentro del pipeline FlashDrive para acelerar la inferencia del modelo Alpamayo-R1-10B.
- Propone bloques de 8 tokens en paralelo que el modelo objetivo verifica en una unica pasada, preservando la distribucion de salida del objetivo.
- Disenado para el dominio de conduccion autonoma, integrando razonamiento de cadena de causalidad (Chain-of-Causation) con planificacion de trayectorias.
- Capacidad multilingue limitada: solo se declara soporte para ingles.
- No soporta tool calling, agentes ni razonamiento multi-paso por si mismo; esas capacidades dependen del modelo base Alpamayo-R1-10B.

## Casos de uso

- Inferencia acelerada en vehiculos autonomos: el modelo se integra en el pipeline FlashDrive para reducir la latencia del razonamiento de Alpamayo-R1-10B en tiempo real, permitiendo decisiones de planificacion de trayectorias mas rapidas.
- Despliegue en hardware embebido o con recursos limitados: su tamano reducido (469 M parametros) y la cuantizacion GGUF permiten ejecutar la parte de decodificacion especulativa en GPUs de gama media o incluso en CPU con BeeLlama.cpp.
- Investigacion en decodificacion especulativa: sirve como referencia para estudiar tecnicas de difusion por bloques aplicadas a modelos VLA de gran tamano.
- Prototipado de sistemas de conduccion autonoma: al acelerar la inferencia, facilita el desarrollo y pruebas de algoritmos de planificacion que dependen del modelo base.
- Evaluacion de cuantizacion en modelos auxiliares: permite analizar el impacto de diferentes niveles de cuantizacion GGUF sobre la calidad de las propuestas del draft.
- Integracion en pipelines de robotica general: aunque esta orientado a conduccion, el mecanismo de decodificacion especulativa puede adaptarse a otros sistemas VLA que requieran baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de aceleracion (speedup) ni comparaciones cuantitativas con otros metodos de decodificacion especulativa. Los articulos asociados (DFlash y FlashDrive) podrian contener dichos datos, pero no estan accesibles en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo de borrador tiene 469 M parametros; en cuantizacion GGUF de 4 bits ocuparia aproximadamente 235 MB, y en 8 bits unos 470 MB. Sin embargo, al utilizarse junto con Alpamayo-R1-10B (10 B parametros), la VRAM total dependera del modelo base y de su cuantizacion.
- GPU recomendadas: para el modelo completo se necesitarian GPUs con al menos 16 GB de VRAM (por ejemplo, RTX 4080, A100 40 GB), aunque el draft en si puede ejecutarse en cualquier GPU moderna con soporte CUDA.
- Compatibilidad con GPUs de consumo: el draft model cabe en cualquier GPU consumer (incluso en una RTX 3060), pero el modelo objetivo de 10 B requiere al menos 12-16 GB dependiendo de la cuantizacion.
- Opciones de despliegue: BeeLlama.cpp (fork de llama.cpp con funciones avanzadas de cuantizacion), FlashDrive (codigo de inferencia oficial, licencia MIT), y potencialmente otros frameworks compatibles con GGUF.
- Latencia y throughput: no se han publicado datos concretos. La ventaja esperada es una reduccion significativa de la latencia frente a la decodificacion autoregresiva completa, gracias a la verificacion en paralelo de bloques de 8 tokens.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros modelos de decodificacion especulativa (por ejemplo, EAGLE, Medusa o Lookahead). El modelo DFlash se diferencia por su mecanismo de difusion por bloques y su orientacion especifica al dominio VLA de conduccion autonoma, pero no hay datos publicos de rendimiento relativo en la documentacion analizada.

## Limitaciones y advertencias

- No es un modelo autonomo: cargarlo directamente sin el pipeline FlashDrive no produce ninguna salida util. Debe usarse siempre junto con el modelo base Alpamayo-R1-10B.
- Licencia restrictiva: el uso es exclusivamente no comercial, segun la NVIDIA License, y se aplica a obras derivadas. Cualquier aplicacion comercial queda prohibida.
- Idioma limitado: solo se declara soporte para ingles; no se garantiza funcionamiento en otros idiomas.
- Riesgo de alucinacion: aunque el draft no genera texto final, las propuestas incorrectas pueden afectar la eficiencia de la decodificacion especulativa, aunque no la distribucion del modelo objetivo.
- Dependencia del modelo base: las capacidades finales (razonamiento, planificacion, vision) dependen integramente de Alpamayo-R1-10B; el draft no anade ni modifica funcionalidades.
- Disponibilidad limitada: el repositorio tiene cero descargas y cero likes, lo que sugiere una adopcion muy reciente o nula. La fecha de creacion (agosto de 2026) indica que es un proyecto muy nuevo y posiblemente en fase experimental.
- Contexto no especificado: se desconoce la longitud de contexto soportada, lo que dificulta evaluar su idoneidad para escenarios con secuencias largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Anbeeld/Alpamayo-R1-10B-DFlash-GGUF
- Modelo de borrador original: https://huggingface.co/z-lab/Alpamayo-R1-10B-DFlash
- Modelo base Alpamayo-R1-10B: https://huggingface.co/z-lab/Alpamayo-R1-10B
- Repositorio GitHub FlashDrive: https://github.com/z-lab/flashdrive
- Repositorio GitHub DFlash: https://github.com/z-lab/dflash
- Repositorio GitHub Alpamayo (NVIDIA): https://github.com/NVlabs/alpamayo
- Articulo arXiv DFlash: https://arxiv.org/abs/2602.06036
- Blog del proyecto FlashDrive: https://z-lab.ai/projects/flashdrive/
- Fork BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
