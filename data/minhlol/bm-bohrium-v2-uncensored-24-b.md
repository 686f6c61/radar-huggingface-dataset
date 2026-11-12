# minhlol/bm-bohrium-v2-uncensored-24-b

## Resumen

`minhlol/bm-bohrium-v2-uncensored-24-b` es un repositorio alojado en Hugging Face bajo la autoría del usuario `minhlol`. Por el identificador se deduce que se trata de un modelo de aproximadamente 24.000 millones de parámetros, etiquetado como "uncensored", lo que sugiere un ajuste fino orientado a reducir los mecanismos de rechazo o alineación del modelo base. Sin embargo, la model card es la plantilla automática de Hugging Face sin cumplimentar, por lo que no hay información verificable sobre el modelo base, el proceso de entrenamiento ni las capacidades reales.

El repositorio presenta un tamaño de 0.0 GB, cero descargas y cero "likes", y fue creado el 12 de noviembre de 2026. Estos indicadores apuntan a un artefacto recién publicado, sin validación por parte de la comunidad y, muy probablemente, sin pesos subidos en el momento de la consulta. La etiqueta `endpoints_compatible` sugiere que el autor pretende desplegarlo mediante Inference Endpoints de Hugging Face, pero no hay evidencia de que el despliegue funcione.

La relevancia de esta ficha es, por tanto, fundamentalmente cautelar: documenta un modelo del que no se puede verificar prácticamente nada y advierte de los riesgos de adoptar en producción artefactos sin model card, sin licencia declarada y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, no confirmado) |
| Parametros totales | ~24 B (deducido del identificador, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declara safetensors en los tags) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (declarado en tags; repositorio de 0.0 GB) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura. La librería declarada es `transformers` y el formato de pesos es `safetensors`, lo que es compatible con un transformer decoder-only estándar, pero el autor no especifica capa de atención, tipo de normalización, vocabulario ni configuración de RoPE. Tampoco se indica si emplea mezcla de expertos (MoE) o es un modelo denso.

Respecto al entrenamiento, la model card no documenta el modelo base, el volumen de tokens, la composición del dataset, ni si hubo etapas de SFT, RLHF o DPO. La etiqueta "uncensored" sugiere un ajuste fino deliberado para eliminar rechazos, pero se desconoce el corpus utilizado y si se aplicaron filtros de seguridad. El único identificador técnico presente en los tags es `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre el cálculo de emisiones de carbono (ML Impact Calculator) y que aparece en la plantilla por defecto de Hugging Face; no es una referencia al modelo.

## Capacidades

- Generación de texto: presumible, por tratarse de un modelo de lenguaje, pero no verificable.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Modo "uncensored": el nombre sugiere ausencia o reducción de rechazos, pero no hay documentación que lo confirme ni que describa el método empleado.

## Casos de uso

No es posible recomendar casos de uso concretos con garantías, dado que no hay pesos verificables, ni benchmarks, ni licencia declarada. A continuación se indican escenarios en los que *podría* emplearse si el modelo se publicase correctamente, con las reservas oportunas:

- Investigación sobre alineación y rechazo: el etiquetado "uncensored" lo haría candidato para estudiar cómo varía la tasa de rechazo frente al modelo base, siempre que se disponga de ambos y de una licencia que lo permita.
- Evaluación de seguridad de modelos abiertos: serviría como caso de prueba en pipelines de red-teaming para medir la eficacia de filtros de contenido.
- Generación creativa sin restricciones: en entornos controlados y con revisión humana, para tareas de escritura de ficción que requieran temáticas sensibles.
- Experimentación académica con modelos de ~24 B: útil para estudiar el comportamiento de modelos de ese orden de magnitud en hardware de un solo nodo, si los pesos están disponibles.
- Fine-tuning posterior: como punto de partida para ajustes específicos de dominio, siempre que la licencia lo autorice (actualmente desconocida).
- Despliegue en Inference Endpoints: la etiqueta `endpoints_compatible` sugiere esa vía, aunque no hay evidencia de que el despliegue funcione con el repositorio actual.

En todos los casos, la ausencia de licencia y de documentación impide un uso comercial o de producción responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo denso de ~24 B, en FP16 se necesitan aproximadamente 48 GB solo para pesos, más overhead de KV cache; en cuantización de 8 bits, ~24 GB; en 4 bits, ~12-14 GB. Estas cifras son estimaciones basadas en el tamaño deducido del nombre, no en datos del autor.
- GPU recomendadas: A100 80 GB o H100 para FP16 sin cuantizar; A100 40 GB o dos RTX 4090 en paralelo para FP16 con tensor parallelism; RTX 4090 (24 GB) para cuantización de 8 bits; RTX 3090/4090 para 4 bits.
- ¿Cabe en consumer GPU? En 4 bits podría caber en una RTX 4090 de 24 GB, pero no hay confirmación de que existan pesos cuantizados publicados.
- Opciones de despliegue: `transformers` (declarado); vLLM, llama.cpp, Ollama o TGI no están confirmados por el autor y dependerían de la arquitectura real.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconocen los parámetros reales, el contexto, la licencia y el rendimiento del modelo. A modo orientativo, se compara con alternativas abiertas de orden de magnitud similar, sin que ello implique equivalencia técnica:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| minhlol/bm-bohrium-v2-uncensored-24-b | ~24 B (no confirmado) | no disponible | no disponible | repositorio de 0.0 GB, 0 descargas |
| Mistral Small 24B (referencia) | 24 B | 128k | Apache 2.0 | pesos públicos y documentados |
| Gemma 2 27B (referencia) | 27 B | 8k | Gemma Terms | pesos públicos y documentados |
| Qwen2.5 32B (referencia) | 32 B | 128k | Apache 2.0 (mayoría de variantes) | pesos públicos y documentados |

La comparativa evidencia la falta de información del modelo analizado frente a alternativas con licencia, contexto y benchmarks públicos.

## Limitaciones y advertencias

- Ausencia total de model card: la plantilla automática no ha sido cumplimentada, por lo que no hay información sobre modelo base, datos, entrenamiento ni evaluación.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; en la práctica, esto impide su adopción en producción.
- Repositorio de 0.0 GB: no hay evidencia de que los pesos estén subidos; el modelo podría no ser descargable ni ejecutable.
- Cero descargas y cero "likes": no hay validación comunitaria ni reportes de uso.
- Etiqueta "uncensored": implica un riesgo elevado de generar contenido dañino, sesgado o no filtrado; requiere revisión humana y filtros adicionales en cualquier despliegue.
- Riesgo de alucinación: no evaluado; al desconocerse el entrenamiento, no se puede estimar su tasa.
- Idiomas y contexto: no disponibles, lo que impide planificar su uso multilingüe o con ventanas largas.
- Sesgos conocidos: no documentados; la ausencia de información no implica ausencia de sesgos.
- Fecha de creación futura (2026-11-12): conviene verificar la autenticidad y el estado real del repositorio antes de cualquier uso.
- Posible suplantación o artefacto abandonado: el patrón (plantilla vacía, sin pesos, sin licencia) es compatible con un repositorio de prueba o abandonado.

## Enlaces

- Hugging Face: https://huggingface.co/minhlol/bm-bohrium-v2-uncensored-24-b
- Artículo referenciado en los tags (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la información disponible.
