# KRMayD/clip-cliprefine-5domains-50ep

## Resumen

KRMayD/clip-cliprefine-5domains-50ep es un repositorio de checkpoints publicado en Hugging Face que contiene diez modelos finales de ajuste fino derivados de BiomedCLIP-vit-bert-hf. Concretamente, agrupa dos variantes de pérdida (CLIP y CLIP-Refine) para cada uno de cinco dominios: BUS-CoT (ecografía mamaria), Brain MRI, Chest CT, COD10K y MAS3K. Los dos últimos son conjuntos de imágenes naturales, pero el autor insiste en que todos los checkpoints, incluidos esos dos, parten del backbone biomédico BiomedCLIP.

El modelo no es un modelo generativo ni un LLM, sino un encoder vision-lenguaje de tipo CLIP orientado a representaciones multimodales. Cada checkpoint es un `state_dict()` plano de PyTorch con las claves nativas del modelo base, no un checkpoint OpenCLIP ni un formato convertible directamente mediante `AutoModel.from_pretrained`. El repositorio ocupa 7,8 GB y no redistribuye imágenes ni captions de entrenamiento.

Su relevancia es fundamentalmente de investigación: sirve como material de comparación frente a otras técnicas (por ejemplo, Token Dropping/TaSA) en tareas de segmentación y clasificación de embeddings biomédicos. El autor no reclama métricas de rendimiento y no se realizó evaluación de clasificación ni segmentación en estas ejecuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP vision-lenguaje (ViT + BERT) sobre backbone BiomedCLIP-vit-bert-hf |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible (checkpoints FP32 en `state_dict`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict()` (`final_model.pt`), no safetensors ni GGUF |
| Modelo base | chuhac/BiomedCLIP-vit-bert-hf (revision c44fed22e30460c0ea1b033a41b68fdab375d64c) |
| Dimension de features de perdida | 768 (pooled/CLS antes de proyeccion final) |
| Proyeccion final | 512 dimensiones (fuera del camino de perdida) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BiomedCLIP-vit-bert-hf: un par de encoders compuesto por un Vision Transformer para imágenes y un encoder BERT para texto, con cabezas de proyección a un espacio compartido. En estos ajustes finos se entrenaron ambos encoders. Siguiendo el repositorio de código fuente, las pérdidas operan sobre features pooled/CLS de 768 dimensiones antes de la proyección final; las cabezas de proyección de 512 dimensiones quedan fuera del camino de pérdida.

El entrenamiento se realizó durante 50 épocas con semilla 42, batch size 8, optimizador AdamW, learning rate 2e-5, weight decay 0.05, 20 épocas de warmup seguidas de decaimiento lineal y precisión FP32. El entorno usó PyTorch 2.4.1+cu121 con Transformers 4.40.2 y Tokenizers 0.19.1 aislados. Se empleó únicamente el adaptador CSV de entrada con pares I+/T+ originales; no se usaron imágenes negativas, captions negativas, Token Dropping ni enmascaramiento de fondo. Los volúmenes de entrenamiento por dominio son: BUS-CoT 4.197 filas, Brain MRI 5.133, Chest CT 1.617 (539 imágenes positivas únicas), COD10K 2.886 y MAS3K 2.328.

## Capacidades

- Extracción de embeddings multimodales imagen-texto en el espacio compartido de BiomedCLIP.
- Representaciones de 768 dimensiones (pooled/CLS) antes de la proyección final, útiles para tareas downstream.
- Ajuste específico por dominio para cinco conjuntos: BUS-CoT, Brain MRI, Chest CT, COD10K y MAS3K.
- Dos variantes de pérdida por dominio: CLIP y CLIP-Refine, para comparación controlada.
- Base biomédica (BiomedCLIP), adecuada para imágenes médicas, aunque también ajustada sobre dos conjuntos naturales (COD10K, MAS3K).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, visión generativa, audio ni generación de texto.

## Casos de uso

- Evaluación comparativa de técnicas de ajuste fino: usar los diez checkpoints como línea base frente a métodos como Token Dropping/TaSA en experimentos de segmentación downstream, cargando cada `final_model.pt` sobre la implementación fijada del modelo base.
- Segmentación biomédica asistida por embeddings: extraer features de 768 dimensiones de imágenes de ecografía mamaria (BUS-CoT) o resonancia cerebral (Brain MRI) y alimentar cabezas de segmentación entrenadas por colaboradores.
- Clasificación de imágenes médicas por dominio: emplear los checkpoints específicos de Chest CT o Brain MRI como extractor congelado en pipelines de clasificación supervisada.
- Investigación en recuperación imagen-texto biomédica: comparar las representaciones CLIP frente a CLIP-Refine en tareas de retrieval dentro de cada dominio.
- Estudio de transferencia entre dominios naturales y médicos: analizar cómo un backbone biomédico ajustado sobre COD10K y MAS3K se comporta en tareas de imágenes naturales frente a checkpoints CLIP convencionales.
- Reproducibilidad de experimentos: reutilizar los manifiestos (`manifest.json`, `checkpoint_manifest.json`) para auditar formatos, tamaños, configuraciones y revisiones de origen en publicaciones científicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se realizó evaluación de clasificación de embeddings ni de segmentación sobre estos diez modelos y que no se reclama ninguna cifra de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 7,8 GB en FP32 para diez checkpoints, por lo que un checkpoint individual ronda varios cientos de MB a pocos GB según el backbone.
- GPU recomendadas: no disponible en la información proporcionada; al ser un modelo CLIP de tamaño moderado, es plausible su ejecución en GPUs consumer, pero el autor no lo especifica.
- Cabe en consumer GPU: no confirmado por el autor.
- Opciones de despliegue: carga manual mediante `torch.load` del `state_dict` sobre `AutoModel.from_pretrained` del modelo base fijado; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KRMayD/clip-cliprefine-5domains-50ep | no disponible | no aplica | sin métricas publicadas | no disponible | Hugging Face (checkpoints `.pt`) |
| chuhac/BiomedCLIP-vit-bert-hf (base) | no disponible | no aplica | no disponible en esta ficha | no disponible | Hugging Face |
| OpenCLIP (variantes ViT-B/32, ViT-L/14) | ~150M–430M según variante | no aplica | benchmarks públicos en el repo original | licencias variables según variante | Hugging Face / OpenCLIP |

La comparación directa con OpenCLIP u otros CLIP queda limitada porque el autor no publica métricas y porque los checkpoints no son compatibles con el formato OpenCLIP. El modelo base BiomedCLIP-vit-bert-hf es la referencia natural para evaluar la ganancia del ajuste fino.

## Limitaciones y advertencias

- No hay evaluación de rendimiento: el autor declara que no se realizaron pruebas de clasificación ni segmentación, por lo que no se puede afirmar que estos checkpoints superen al modelo base.
- Formato no estándar: son `state_dict()` planos que requieren cargar primero la implementación fijada del modelo base con `trust_remote_code=True`; `AutoModel.from_pretrained` sobre este repositorio no funciona por sí solo.
- Licencia no especificada: no se indica licencia, lo que impide asumir permisos de uso comercial; debe contactarse con el autor o consultar la licencia del modelo base.
- Idiomas no declarados: al ser un modelo de embeddings imagen-texto, el comportamiento multilingüe depende del encoder BERT subyacente y no está documentado.
- Sesgos: no documentados; los datos biomédicos pueden introducir sesgos de población, equipo de adquisición o institución.
- Riesgo de alucinación: no aplica directamente al no ser generativo, pero los embeddings pueden producir recuperaciones erróneas en dominios fuera de distribución.
- Restricciones de datos: las imágenes y captions de entrenamiento no se redistribuyen, lo que limita la reproducibilidad completa.
- Uso clínico: sin validación clínica ni métricas, no debe emplearse en decisiones médicas reales.
- Dominios naturales con backbone biomédico: COD10K y MAS3K usan BiomedCLIP como base, lo que puede no ser óptimo frente a CLIP convencional para imágenes naturales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KRMayD/clip-cliprefine-5domains-50ep
- Modelo base: https://huggingface.co/chuhac/BiomedCLIP-vit-bert-hf/tree/c44fed22e30460c0ea1b033a41b68fdab375d64c
- Código de entrenamiento: https://github.com/pianoprincesjy/biomedclip_finetuning/tree/2bd2d6cf323c0e379d622978bba6fb88405d975e
