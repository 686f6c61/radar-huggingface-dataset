# bhusalb/privacy-preserving-icl

## Resumen

Privacy Preserving In-Context Learning (DP-ICL) es un marco metodologico, no un modelo con pesos propios, presentado por Bishnu Bhusal, Manoj Acharya, Ramneet Kaur, Colin Samplawski, Anirban Roy, Adam D. Cobb, Rohit Chadha y Susmit Jha en AAAI 2026. El repositorio de Hugging Face no contiene pesos: la tecnica opera en tiempo de inferencia sobre un modelo abierto ya existente (en los experimentos del articulo, Gemma 1.1 2B instruction-tuned) y el codigo se distribuye en GitHub.

El problema que aborda es la fuga de informacion sensible a traves de los prompts: cuando un LLM recibe registros privados como ejemplos de in-context learning, esos datos pueden filtrarse en la salida. El marco ejecuta inferencia sobre los registros privados, agrega las distribuciones de salida por token bajo garantias formales (ε, δ)-diferenciales y genera demostraciones sinteticas con privacidad diferencial para usar en los prompts. Un paso de mezcla combina inferencia privada y publica para mejorar la utilidad.

Su relevancia actual reside en que ofrece garantias formales de privacidad sin fine-tuning y supera a metodos previos de ICL privado en tareas de in-context learning, segun los autores. Al depender de la distribucion completa de logits por token, solo es aplicable a modelos de pesos abiertos ejecutados localmente, no a APIs que devuelven unicamente texto generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (marco de inferencia sobre un LLM existente; experimentos con Gemma 1.1 2B instruction-tuned) |
| Parametros totales | No disponible (depende del modelo base; 2B en los experimentos del articulo) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (tag de idioma: en) |
| Licencia | No disponible |
| Formato de pesos | No contiene pesos; el repositorio solo aloja la model card y enlaces |

## Arquitectura y entrenamiento

El marco no entrena ni publica un modelo. Se apoya en un transformer decoder-only preentrenado (Gemma 1.1 2B instruction-tuned en los experimentos) y anade un procedimiento de privacidad en la fase de inferencia. El requisito tecnico central es el acceso a la distribucion completa de logits a nivel de token en cada paso de decodificacion, lo que excluye APIs de solo texto y obliga a ejecutar el modelo en infraestructura propia.

El flujo descrito en la model card es: (1) inferencia sobre los registros privados, (2) agregacion de las distribuciones de salida por token bajo privacidad diferencial (ε, δ), (3) generacion de demostraciones sinteticas DP para los prompts y (4) una etapa de mezcla que combina inferencia privada y publica para mejorar la utilidad. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que no hay entrenamiento de pesos implicado.

## Capacidades

- Generacion de demostraciones sinteticas de in-context learning con garantias formales (ε, δ)-diferenciales.
- Privacidad diferencial a nivel de token sobre las distribuciones de salida del LLM.
- Mezcla de inferencia privada y publica para equilibrar privacidad y utilidad.
- Funcionamiento sin fine-tuning sobre modelos de pesos abiertos.
- Aplicable a tareas de in-context learning en las que se usan registros sensibles como ejemplos.
- Soporte limitado al ingles segun los metadatos del repositorio.
- No se documentan tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Clasificacion de textos clinicos con ICL: usar notas medicas privadas como ejemplos en el prompt generando demostraciones sinteticas DP, de modo que el modelo aprenda el formato de la tarea sin exponer registros de pacientes.
- Analisis de documentos legales confidenciales: construir prompts few-shot a partir de contratos privados sustituyendo los ejemplos reales por demostraciones sinteticas con garantia (ε, δ).
- Etiquetado de datos internos de una empresa: generar ejemplos sinteticos privados para tareas de clasificacion sobre correos o tickets de soporte sin filtrar su contenido.
- Investigacion con datos personales sujetos a RGPD: ejecutar el marco sobre un modelo abierto local para obtener utilidad de ICL manteniendo una cota formal de divulgacion.
- Evaluacion de robustez de pipelines de IA: medir cuanto se filtra informacion sensible en prompts few-shot y sustituirlos por alternativas DP.
- Despliegue en entornos con requisitos de cumplimiento: al requerir pesos abiertos y ejecucion local con acceso a logits, encaja en infraestructuras on-premise donde no se permite enviar datos a APIs externas.
- Aumento de datos con privacidad: generar demostraciones sinteticas para aumentar conjuntos de ejemplos few-shot en tareas de NLP en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma que el metodo supera a metodos previos de ICL privado en tareas de in-context learning, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: depende del modelo base. Con Gemma 1.1 2B en precision completa se requieren aproximadamente 5-6 GB; en cuantizacion de 8 bits, en torno a 3 GB; en 4 bits, alrededor de 2 GB (estimaciones orientativas, no publicadas por los autores).
- GPU recomendadas: cualquier GPU con suficiente VRAM para el modelo base; una RTX 4090 o A100 sobran para un modelo de 2B. No se especifican requisitos adicionales por el calculo de privacidad diferencial.
- Cabe en GPU de consumo: si, con un modelo base de 2B en cuantizacion de 8 o 4 bits en GPUs como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: requiere un runtime que exponga los logits por token; el codigo esta en GitHub y no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Las APIs de solo texto no son compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Metodo | Tipo | Modelo base | Garantia de privacidad | Fine-tuning | Licencia |
|---|---|---|---|---|---|
| DP-ICL (este trabajo) | Marco de inferencia | Gemma 1.1 2B (experimentos) | (ε, δ)-DP formal | No | No disponible |
| ICL privado previo (metodos citados por los autores) | Marco de inferencia | Variable | DP, segun el articulo | No | No disponible |
| Prompting few-shot estandar | Tecnica de prompting | Cualquier LLM | Ninguna | No | No aplica |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la model card solo indica una mejora cualitativa frente a metodos previos de ICL privado.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni pipeline; es una model card de un articulo. No puede descargarse como modelo.
- Requiere acceso a la distribucion completa de logits por token, por lo que no funciona con APIs que solo devuelven texto generado.
- Los experimentos se limitan al ingles y a Gemma 1.1 2B; no se documenta su comportamiento con otros modelos o idiomas.
- Las garantias (ε, δ) implican un compromiso entre privacidad y utilidad; valores bajos de ε degradan la calidad de las demostraciones sinteticas.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial del codigo.
- Riesgo de alucinacion inherente al modelo base subyacente; el marco no lo mitiga.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La fecha de creacion del repositorio (2026-11-06) es posterior a la publicacion del articulo en AAAI 2026; conviene verificar el estado real del codigo antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/bhusalb/privacy-preserving-icl
- Demo (Space): https://huggingface.co/spaces/bhusalb/privacy-preserving-icl
- Paper (arXiv): https://arxiv.org/abs/2509.13625
- Paper (AAAI 2026, DOI): https://doi.org/10.1609/aaai.v40i42.40838
- Codigo (GitHub): https://github.com/bhusalb/privacy-preserving-icl
- Poster (DOI): https://doi.org/10.48448/8as1-z797
