# masahiroid/mdeberta-v3-base-coreai

## Resumen

`masahiroid/mdeberta-v3-base-coreai` es una conversión del checkpoint `microsoft/mdeberta-v3-base` al formato `.aimodel` de Apple Core AI, empaquetada para su ejecución en GPU bajo macOS mediante el runtime `coreai-core`. No se trata de un modelo nuevo ni de un fine-tuning: es un encoder multilingüe de tipo DeBERTa-v3 (arquitectura transformer con atención desenredada y embedding de posiciones relativas) exportado en precisión F32 con una forma de entrada fija de `[1, 128]`. El modelo devuelve únicamente estados ocultos a nivel de token, sin cabeza de tarea añadida.

Su relevancia es práctica: permite ejecutar el encoder base de mDeBERTa-v3 dentro del ecosistema nativo de Apple (Core AI, no Core ML) sin depender de PyTorch en tiempo de inferencia. Es un artefacto orientado a desarrolladores que necesitan integrar embeddings contextuales multilingües en aplicaciones macOS con aceleración por GPU, y que después aplicarán su propia cabeza de clasificación o extracción de características.

El repositorio tiene 1,1 GB, licencia MIT y no registra descargas ni interacciones en el momento de la consulta. Al no incluir cabecera de tarea, cualquier uso productivo requiere fine-tuning posterior o el uso de los estados ocultos como features para un modelo downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (atención desenredada, posiciones relativas) |
| Parametros totales | no disponible (modelo base mdeberta-v3-base, sin cifra publicada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (forma de entrada fija `[1, 128]` en el export) |
| Tipos de cuantizacion | F32 (baseline); el autor indica explícitamente que no es una cuantización de 4 bits |
| Idiomas soportados | multilingüe (heredado de mdeberta-v3-base); lista concreta no disponible |
| Licencia | MIT (pesos y conversión); términos upstream en `LICENSE` |
| Formato de pesos | `.aimodel` (Apple Core AI); existen variantes MLX, Core ML y GGUF en repos separados |

## Arquitectura y entrenamiento

La arquitectura subyacente es DeBERTa-v3, un transformer encoder con atención desenredada (contenido y posición calculados en flujos separados) y embeddings de posición relativa, lo que mejora la modelización de dependencias a distancia frente a BERT clásico. mDeBERTa-v3-base es la variante multilingüe de ese diseño, entrenada originalmente por Microsoft; el checkpoint de origen está fijado en la revisión `a0484667b22365f84929a935b5e50a51f71f159d`.

Este repositorio no introduce entrenamiento nuevo: es una conversión de checkpoint. El autor documenta el proceso de exportación con `coreai-torch 0.4.3`, PyTorch 2.14.1, Transformers 4.57.3 y un entorno Python 3.14 separado para la validación. La validación numérica se hizo contra la implementación original de PyTorch sobre 6 casos deterministas, con una diferencia absoluta máxima de salida de 0,00066739321 y una similitud coseno mínima de 0,99999988. Son pruebas de paridad de conversión, no benchmarks de calidad de tarea ni de latencia.

La innovación relevante no está en el modelo sino en el formato: exportación nativa a Core AI para ejecución en GPU en macOS 27.2, con tokenizador cargado vía `transformers` (lento, `use_fast=False`) y padding/truncado obligatorio a 128 tokens.

## Capacidades

- Generación de estados ocultos a nivel de token (encoder puro); no genera texto de forma autoregresiva.
- Representaciones contextuales multilingües, heredadas del modelo base.
- Extracción de embeddings para clasificación, NER, similitud semántica o reranking, siempre que se añada una cabeza o se usen las features directamente.
- No incluye tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No dispone de modo thinking, visión ni audio.
- No incluye cabeza de enmascarado (fill-mask) en este export, aunque el modelo original de Microsoft se publica con pipeline `fill-mask`.

## Casos de uso

- Clasificación de texto en aplicaciones macOS nativas: cargar el `.aimodel` con `AIModel.load`, obtener los estados ocultos y alimentar un clasificador ligero entrenado aparte; encaja porque el runtime ejecuta en GPU sin PyTorch.
- Extracción de embeddings para búsqueda semántica: usar la salida del encoder como vector de documento o consulta en un índice local; útil en apps de escritorio que necesitan recuperación offline multilingüe.
- Reranking de resultados: puntuar pares consulta-documento con una cabeza de clasificación sobre los hidden states, aprovechando el contexto fijo de 128 tokens para pares cortos.
- Detección de idioma o filtrado de contenido: fine-tuning de una cabeza sobre las representaciones del encoder para tareas de etiquetado por secuencia.
- Prototipado de pipelines NLP en macOS: validar la paridad numérica frente a PyTorch antes de migrar a producción, dado que el autor incluye `validation.json` y scripts de conversión.
- Integración en herramientas de análisis de sentimiento: el propio autor menciona pruebas con emociones en inglés, texto neutro de recuperación, japonés, entrada vacía y truncado, lo que sugiere uso en clasificación de sentimiento multilingüe.
- Base para NER o etiquetado de tokens: al devolver estados ocultos por token, se puede acoplar una capa CRF o lineal para extracción de entidades en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de paridad de conversión (diferencia absoluta máxima 0,00066739321 y similitud coseno mínima 0,99999988 sobre 6 casos deterministas), que no equivalen a MMLU, GLUE ni ninguna otra evaluación de calidad.

## Requisitos de hardware

- VRAM estimada: no disponible con cifra concreta; el repo ocupa 1,1 GB en F32, por lo que la huella en memoria es del orden de ese tamaño más overhead del runtime.
- GPU recomendadas: ejecución validada en GPU bajo macOS 27.2 con `coreai-core==1.0.0b3`; no se especifican modelos de GPU concretos (Apple Silicon u otras).
- Cabe en GPU de consumo: sí, por tamaño, pero solo en el ecosistema Apple Core AI; no hay validación documentada fuera de ese entorno.
- Opciones de despliegue: Apple Core AI (`.aimodel`); el autor publica variantes MLX, Core ML y GGUF en repos separados para otros runtimes.
- Latencia y throughput: no disponibles; el autor indica explícitamente que la validación no es un benchmark de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| masahiroid/mdeberta-v3-base-coreai | no disponible | 128 tokens (fijo) | `.aimodel` | MIT | Conversión F32 para Core AI, sin cabeza de tarea |
| microsoft/mdeberta-v3-base | no disponible | el original (mayor que 128; cifra no disponible) | safetensors/PyTorch | MIT | Modelo base original, pipeline `fill-mask` |
| masahiroid/mdeberta-v3-base-mlx | no disponible | contexto original preservado | MLX | MIT | Misma conversión para runtime MLX |
| masahiroid/mdeberta-v3-base-gguf | no disponible | contexto original preservado | GGUF | MIT | Misma conversión para llama.cpp y afines |

La comparación relevante es entre formatos del mismo checkpoint: Core AI impone 128 tokens fijos, mientras que las variantes MLX y GGUF preservan el contexto máximo original. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- No es un modelo generativo: devuelve estados ocultos y requiere cabeza o fine-tuning para cualquier tarea concreta.
- Ventana de contexto truncada a 128 tokens en este export; secuencias más largas se recortan, con pérdida de información.
- Solo validado en macOS 27.2 con `coreai-core==1.0.0b3`; el autor advierte que la compatibilidad fuera de ese entorno no está garantizada.
- No es Core ML (`.mlpackage`); requiere el runtime Core AI, lo que limita su portabilidad.
- Riesgo de alucinación no aplica en sentido estricto al no generar texto, pero los embeddings pueden producir representaciones poco fiables en dominios alejados del entrenamiento original.
- Sesgos: heredados del corpus multilingüe de mdeberta-v3-base; no se documenta auditoría de sesgos en este repositorio.
- Licencia MIT para pesos y conversión, pero los términos upstream deben consultarse en `LICENSE`; no se implica certificación de seguridad ni licencia comercial adicional.
- Sin descargas ni validación comunitaria: el artefacto es reciente y no ha sido contrastado por terceros.
- El tokenizador debe usarse con `use_fast=False` y padding/truncado a 128, lo que añade complejidad de integración.

## Enlaces

- Repositorio Core AI: https://huggingface.co/masahiroid/mdeberta-v3-base-coreai
- Variante MLX: https://huggingface.co/masahiroid/mdeberta-v3-base-mlx
- Variante Core ML: https://huggingface.co/masahiroid/mdeberta-v3-base-coreml
- Variante GGUF: https://huggingface.co/masahiroid/mdeberta-v3-base-gguf
- Modelo base original: https://huggingface.co/microsoft/mdeberta-v3-base
- Revisión del checkpoint de origen: https://huggingface.co/microsoft/mdeberta-v3-base/tree/a0484667b22365f84929a935b5e50a51f71f159d
- API de Hugging Face del modelo base: https://huggingface.co/api/models/microsoft/mdeberta-v3-base
