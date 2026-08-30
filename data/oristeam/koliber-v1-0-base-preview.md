# OrisTeam/Koliber-v1.0-Base-Preview

## Resumen

Koliber v1.0 Base - Preview es un modelo de lenguaje causal (decoder-only) compacto de 126 millones de parámetros desarrollado por OrisTeam y entrenado desde cero (from scratch) para el idioma polaco. Se publica como un checkpoint de preentrenamiento en fase de vista previa, no como modelo final: ha visto aproximadamente 975 millones de tokens y no ha pasado por ninguna etapa de ajuste por instrucciones (SFT) ni de alineación por preferencias. Su propósito principal es la continuación de texto: dado un prefijo en polaco, genera una secuencia coherente.

El modelo emplea una arquitectura transformer con atención GQA (12 cabezas de consulta y 2 de clave/valor), codificación posicional RoPE, activación SwiGLU y normalización RMSNorm, con una longitud de contexto de 1536 tokens. Su tamaño reducido lo hace adecuado para entornos con recursos limitados, aunque su capacidad bruta es modesta. La relevancia actual radica en que es uno de los pocos modelos base en polaco entrenados desde cero y publicados con licencia Apache-2.0, lo que permite su uso comercial y su integración en proyectos de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) con GQA |
| Parametros totales | 150.719.232 (safetensors); 126.044.928 según model card (LM head atado) |
| Parametros activos | 126.044.928 (no es MoE) |
| Longitud de contexto | 1536 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16, sin cuantizaciones publicadas) |
| Idiomas soportados | Polaco (principal) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código remoto en transformers) |

## Arquitectura y entrenamiento

Koliber es un transformer decoder-only de 12 capas con hidden size de 768 y FFN de 3072. Usa atención GQA con 12 cabezas de consulta y 2 cabezas de clave/valor, cada una con dimensión 64. La codificación posicional es RoPE y la activación es SwiGLU. La normalización es RMSNorm y no se utilizan sesgos. El LM head está atado a las embeddings. El modelo se entrenó desde cero con aproximadamente 974,7 millones de tokens, sin que se haya especificado la composición exacta del dataset.

Una innovación destacable es el objetivo auxiliar de entrenamiento: además de la pérdida estándar de predicción del siguiente token, se añade una cabeza auxiliar (solo de entrenamiento) que predice una representación oculta futura unos 128 tokens adelante, muestreada cada 32 tokens, mediante una proyección de baja dimensión (192) y pérdida de distancia coseno. El peso de esta pérdida es 0,03 sobre la pérdida principal. Esta cabeza no forma parte del modelo de inferencia y no añade parámetros en tiempo de ejecución. No se ha aplicado RLHF ni DPO.

## Capacidades

- Generación de texto en polaco: continúa prefijos de lenguaje natural de forma coherente, como se muestra en los ejemplos de la model card.
- Modelo base: no sigue instrucciones ni mantiene conversaciones; no es un chatbot.
- Sin fine-tuning: no tiene capacidad de tool calling, ni de razonamiento multi-paso, ni de agente.
- Sin soporte de visión ni audio: es exclusivamente texto.
- Multilingüismo limitado: entrenado principalmente en polaco; puede generar algo en otros idiomas pero con calidad impredecible.
- Capacidad de contexto moderada: 1536 tokens, suficiente para párrafos pero no para documentos largos.

## Casos de uso

- Autocompletado de texto en polaco: integración en editores de texto o aplicaciones de escritura para sugerir continuaciones de frases o párrafos en polaco, aprovechando su naturaleza de modelo base de continuación.
- Generación de contenido preliminar: creación de borradores de artículos, noticias o descripciones de productos en polaco, donde el modelo produce texto inicial que luego un humano revisa y edita.
- Aumento de datos para NLP en polaco: uso como generador de variaciones de texto para entrenar otros modelos más grandes o para crear datasets sintéticos de clasificación o extracción.
- Investigación académica en modelos compactos: estudio del comportamiento de modelos pequeños entrenados desde cero, especialmente el efecto del objetivo auxiliar de predicción de estados futuros en la calidad de las representaciones.
- Prototipado de aplicaciones de generación de texto: desarrollo rápido de demos o MVPs que requieran generación de lenguaje polaco sin necesidad de un modelo grande, gracias a su bajo coste de inferencia.
- Fine-tuning posterior: punto de partida para ajuste por instrucciones (SFT) o adaptación a tareas específicas en polaco, dado que es un modelo base limpio sin alineación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente muestra comparaciones cualitativas de generación frente a Azurro/APT3-275M-Base, sin métricas numéricas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~150M de parámetros en fp32 (~600 MB). En fp16 (~300 MB) cabe en cualquier GPU con más de 1 GB de VRAM. En cuantización de 8 bits (~150 MB) o 4 bits (~75 MB) cabría incluso en CPU con memoria suficiente.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: sí, es un modelo muy pequeño que puede ejecutarse en GPUs de gama baja e incluso en CPU con llama.cpp (si se convierte a GGUF).
- Opciones de despliegue: transformers (con trust_remote_code), vLLM, TGI, llama.cpp, Ollama (si se convierte a formato GGUF). El modelo viene en safetensors y requiere el código remoto de OrisTeam.
- Latencia y throughput: no hay datos oficiales, pero para un modelo de 126M la generación es de decenas de tokens por segundo en GPU consumer y de unos pocos tokens por segundo en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Estado |
|---|---|---|---|---|---|
| Koliber v1.0 Base - Preview | 126M | 1536 | Polaco | Apache-2.0 | Base, preview |
| Azurro/APT3-275M-Base | 275M | no disponible | Polaco (presumible) | no disponible | Base |
| Polish RoBERTa (dkleczek/roberta-polish-kgr10) | ~102M (encoder) | 512 | Polaco | MIT | Encoder, no generativo |

No se dispone de benchmarks comparativos entre estos modelos. Koliber es generativo, mientras que Polish RoBERTa es solo encoder. APT3-275M-Base es también generativo y de mayor tamaño, pero no se conocen sus especificaciones completas.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento en vista previa, no el modelo final. El preentrenamiento no está terminado.
- No ha recibido ajuste por instrucciones (SFT), por lo que no sigue comandos ni mantiene conversaciones. Intentar usarlo como chatbot dará resultados pobres.
- Modelo pequeño (126M): tiende a desviarse del tema, repetir texto, imitar patrones de SEO y alucinar hechos.
- Genera texto en polaco principalmente; otros idiomas pueden producir resultados incoherentes.
- La longitud de contexto de 1536 tokens es limitada para tareas que requieran memoria a largo plazo.
- No se han publicado benchmarks ni evaluaciones sistemáticas; el rendimiento real es incierto.
- Los ejemplos de generación en la model card son continuaciones crudas muestreadas y pueden contener información inventada o incorrecta.
- No debe usarse para tomar decisiones basadas en hechos sin verificación humana.
- El acceso al repositorio puede requerir aceptar términos o advertencias, aunque la licencia es Apache-2.0 y permite uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OrisTeam/Koliber-v1.0-Base-Preview
- Perfil de OrisTeam en HuggingFace: https://huggingface.co/OrisTeam/models
- Repositorio de referencia comparada (Azurro/APT3-275M-Base): no se ha encontrado enlace directo en la información proporcionada
