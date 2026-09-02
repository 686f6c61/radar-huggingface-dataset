# DotCheck/valla-text-v14_3

## Resumen

Valla@14.3 es un detector de texto generado por inteligencia artificial desarrollado por DotCheck (Petr Jaroch). Se trata de un clasificador binario que, dado un texto UTF-8 y un código de idioma explícito, devuelve una probabilidad p en [0,1] que estima la probabilidad de que el texto haya sido escrito por una IA, no la veracidad del contenido. El modelo resuelve el problema de la detección de contenido sintético en ocho idiomas, un área crítica ante la proliferación de textos generados por modelos como ChatGPT o Claude.

Arquitectónicamente no es un transformer monolítico, sino un conjunto de encoders congelados combinados con cabezas lineales específicas por idioma. Para los idiomas latinos (en, es, pt, fr, it, de, nl) fusiona las representaciones de TMR (Oxidane/tmr-ai-text-detector), e5-small (intfloat/e5-small) y un BERT-tiny por idioma, seguidas de una pila de cuatro parámetros. Para chino simplificado utiliza un MacBERT congelado. El repositorio solo contiene las cabezas `.npz` (Apache-2.0); los encoders base no se redistribuyen y deben obtenerse de sus repositorios originales. No es un paquete `transformers` `AutoModel`, sino un artefacto de la librería `dotcheck` servido mediante FastAPI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de encoders congelados (TMR cls, e5-small mean, BERT-tiny cls, MacBERT cls_emb) con cabezas lineales por idioma |
| Parametros totales | no disponible (solo se publican las cabezas `.npz`; los encoders base no se redistribuyen) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo; el entrenamiento usa ventanas de 520–1100 caracteres) |
| Tipos de cuantizacion | no disponible (pesos `.npz` de cabezas, sin cuantizacion declarada) |
| Idiomas soportados | en, zh (simplificado), es, pt, fr, it, de, nl |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` (cabezas); los encoders base usan safetensors en sus repositorios originales |

## Arquitectura y entrenamiento

El modelo combina dos grupos de encoders. Para los idiomas latinos, el texto se limpia con el preprocesado TC1 (eliminacion de citas estilo wiki, colapso de espacios en blanco, eliminacion de tokens `#category`) y se pasa por tres torres congeladas: Rask (TMR, token `cls`), Comenius (e5-small, pooling `mean`) y un BERT-tiny especifico por idioma (token `cls`). Las tres representaciones se combinan en una pila de cuatro parametros: p = sigma(w0·z_r + w1·z_c + w2·delta + b), con umbral de decision en 0.5. Para chino simplificado se usa un MacBERT congelado cuya salida `cls_emb` alimenta una cabeza logistica (`zh_v1`). Los idiomas no soportados fallan de forma cerrada (`unsupported_language`) sin fallback silencioso a ingles; el chino tradicional dominante no se puntua (`und`).

El entrenamiento usa datos de auto-generacion comercial limpia: para ingles, Qwen2.5-7B, Mistral-7B y Grok-4.5 como IA de ajuste, y Qwen2.5-1.5B como IA de validacion (disjunta, con sesgo enciclopedico). Los textos humanos provienen de Gutenberg.org (40%), Wikipedia (35%) y WikiText (25%), segmentados en ventanas de 520–1100 caracteres. Para los otros idiomas latinos se mantienen mezclas wiki/WikiText/Gutenberg; para chino, prosa inicial de Wikipedia con conversion OpenCC t2s. No se usan datasets con licencia NC ni textos extraidos de ChatGPT o Claude en produccion. No se aplica RLHF ni DPO, al tratarse de una tarea de clasificacion supervisada.

## Capacidades

- Deteccion binaria de texto generado por IA frente a texto humano, con salida probabilistica p en [0,1].
- Soporte multilingue para ocho idiomas: ingles, chino simplificado, espanol, portugues, frances, italiano, aleman y neerlandes.
- Preprocesado TC1 integrado que normaliza el texto antes de la puntuacion (elimina citas wiki, colapsa espacios, elimina tokens de categoria).
- Requiere un codigo de idioma explicito (`lang`) en la entrada; no hay deteccion automatica de idioma.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-paso, ni agentes.
- No incluye capacidades de vision ni audio; es exclusivamente clasificacion de texto.

## Casos de uso

- Moderacion de contenido en plataformas de publicacion: el modelo puede puntuar comentarios o articulos en tiempo real para marcar posibles textos generados por IA, gracias a su latencia baja en CPU y su salida probabilistica interpretable.
- Verificacion de autenticidad en entornos academicos: permite auditar ensayos o trabajos de estudiantes comparando la probabilidad de origen IA frente a escritura humana, con umbrales configurables por la institucion.
- Filtrado de resenas falsas en comercio electronico: al soportar varios idiomas, puede integrarse en pipelines de moderacion de resenas de productos para detectar contenido sintetico generado en masa.
- Auditoria de contenido de marketing: agencias y departamentos de comunicacion pueden verificar si textos publicitarios o de blog han sido generados por IA, para cumplir politicas de transparencia.
- Deteccion de spam en foros y redes sociales: el modelo puede clasificar mensajes sospechosos de ser generados por bots de IA, reduciendo el ruido en sistemas de soporte comunitario.
- Analisis forense de textos: en investigaciones periodisticas o legales, permite evaluar la probabilidad de que un documento o comunicacion haya sido producido por una IA, como evidencia complementaria.
- Integracion en pipelines editoriales: antes de publicar contenido, un sistema puede puntuar automaticamente los textos y alertar a los editores si superan un umbral de probabilidad IA, ayudando a mantener estandares de autorfa humana.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card, sobre el conjunto RAID-lite EN (ventanas de 520–1100 caracteres), son los siguientes:

| Metrica | Valor |
|---|---|
| Media P(AI) en textos humanos | 0.029 |
| Media P(AI) en textos IA | 0.984 |
| Precision balanceada | 0.979 |

El autor declara ademas umbrales minimos absolutos para todas las cabezas de idioma: media P(AI) humana ≤ 0.12, media P(AI) IA ≥ 0.85 y precision balanceada ≥ 0.90, todos con umbral de decision 0.5. No se han publicado resultados de benchmarks para los otros siete idiomas en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para servirse con FastAPI en CPU; las torres congeladas (BERT-tiny, e5-small, TMR, MacBERT) son de tamano reducido, por lo que la VRAM no es un requisito critico.
- VRAM estimada: no disponible oficialmente, pero al tratarse de encoders pequenos (el mayor es MacBERT, ~100M parametros) cabe en GPUs consumer con 2–4 GB de VRAM si se opta por aceleracion GPU.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., RTX 3050, RTX 4060) es suficiente; para despliegue en CPU, un servidor con 8–16 GB de RAM es adecuado.
- Opciones de despliegue: el repositorio indica servir mediante FastAPI con endpoint `POST /v1/analyze-text`; no es compatible con vLLM, Ollama ni TGI al no ser un LLM generativo.
- Latencia y throughput: no se proporcionan datos oficiales; al serializar las GEMMs de las torres compartidas, el rendimiento en CPU sera moderado, adecuado para peticiones individuales o lotes pequenos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros detectores de texto IA en la informacion proporcionada. Se menciona que `fakespot-ai/roberta-base-ai-text-detection-v1` (Apache-2.0) se utiliza como base de rollback en Valla@14.3, pero no se publican metricas comparativas. Otros detectores conocidos como GPTZero o Turnitin no publican pesos abiertos, por lo que no es posible una comparacion directa. La informacion disponible no permite establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Sesgo de datos: los textos humanos de entrenamiento provienen exclusivamente de Gutenberg, Wikipedia y WikiText, lo que puede limitar la generalizacion a otros registros (conversacionales, tecnicos, coloquiales) y favorecer falsos positivos en escritura formal.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero la puntuacion puede ser erronea en textos cortos o muy atipicos; no hay garantia de precision en dominios no representados en el entrenamiento.
- Limitaciones de idioma: solo soporta ocho idiomas; cualquier otro codigo devuelve `unsupported_language` sin puntuacion. El chino tradicional dominante no se puntua (`und`), y no hay deteccion automatica de idioma.
- Restricciones de licencia: aunque las cabezas son Apache-2.0, los encoders base tienen licencias MIT o Apache-2.0, pero no se redistribuyen en este repositorio; el usuario debe descargarlos por separado y verificar sus respectivas licencias.
- No es un paquete `transformers`: no se puede cargar con `AutoModel`; requiere la libreria `dotcheck` y el flujo de inferencia documentado.
- Politica de producto: la longitud minima y los limites de uso justo son politica de DotCheck en su servicio Express, no propiedades de las cabezas; el despliegue local no incluye esas restricciones.
- Rendimiento fuera de ingles: no se publican benchmarks para los otros idiomas, solo umbrales minimos declarados; el rendimiento real en espanol, frances, etc. no esta verificado de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DotCheck/valla-text-v14_3
- Documentacion tecnica de DotCheck: https://dotcheck.ai/docs
- Perfil de DotCheck en HuggingFace: https://huggingface.co/DotCheck
- Model card en PDF (v2026.7): https://dotcheck.ai/media/docs/dotcheck-model-card-v2026.7.pdf
- Modelos con tag `dotcheck` en HuggingFace: https://huggingface.co/models?other=dotcheck
