# chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith

## Resumen

MoziAI-35B-V3.8 es un ajuste fino (finetune) del modelo base Ornith-1.5-35B-A3B, publicado por el usuario chenyumo bajo el identificador `chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith`. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parámetros totales, orientado a generación de texto, razonamiento financiero, tool calling y despliegue local. El autor lo presenta como un modelo multimodal ("vision" en los tags) con soporte de decodificación especulativa (MTP) y una variante de cuantización propia denominada MoziSmartBit.

La propuesta de valor del modelo es el despliegue local en hardware de consumo: según la model card, la cuantización MoziSmartBit comprime el modelo hasta aproximadamente 15,9 GB, lo que permitiría ejecutarlo en GPUs con 20 GB o más de VRAM. El modelo se distribuye principalmente en formato GGUF para llama.cpp, lo que facilita su uso con herramientas como llama.cpp, Ollama o servidores compatibles con la API de OpenAI (tag `endpoints_compatible`).

Es relevante ahora porque combina varias tendencias del ecosistema open source: modelos MoE de tamaño medio con activación dispersa, ajustes verticales para dominios especializados (finanzas), soporte explícito de tool calling y agentes, y una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales. La model card menciona además un "marco de pensamiento dinámico de siete dimensiones" y un mecanismo de iteración tipo agente denominado LOOP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`; arquitectura Qwen3.5-35B-A3B / Qwen3.6-35B-A3B según la model card) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el sufijo A3B del modelo base sugiere ~3B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantización propia MoziSmartBit (≈15,9 GB); comparación con Q4_K_M (≈22 GB) mencionada en la model card; no se detallan otros niveles |
| Idiomas soportados | zh, en (la model card afirma soporte de 201 idiomas y dialectos, con optimización especial del chino) |
| Licencia | Apache-2.0 (componentes upstream Qwen/Gemma Apache-2.0; incrementos Ornith bajo MIT, según NOTICE) |
| Formato de pesos | GGUF (librería `llama-cpp`); el repo ocupa 47,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts, construido sobre Ornith-1.5-35B-A3B, que a su vez se apoya en la arquitectura Qwen3.5-35B-A3B / Qwen3.6-35B-A3B según la model card. Los tags incluyen `MTP` (Multi-Token Prediction), lo que indica soporte de decodificación especulativa para acelerar la inferencia, y `imatrix`, señal de que las cuantizaciones GGUF se generaron con matrices de importancia.

El ajuste fino incorpora, según el autor, datos financieros propios, capacidades de dominio financiero, un marco de razonamiento denominado "pensamiento dinámico de siete dimensiones" (con niveles 0, 1 y 2 según la complejidad de la tarea), un mecanismo de iteración tipo agente llamado LOOP (ejecutar y evaluar, luego ajustar y verificar) y una optimización "uncensored" que elimina restricciones de moderación de contenido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. La cuantización MoziSmartBit aplica precisión diferenciada por capas sobre la estructura MoE, con una ratio de compresión declarada de 4,5x y una retención de precisión del ~99 % respecto a FP16 según el autor.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `text-generation`.
- Razonamiento estructurado mediante el marco "moziAI-Think" de siete dimensiones, con profundidad adaptativa según la complejidad de la tarea.
- Iteración tipo agente con el mecanismo "moziAI-Loop" (ejecución, evaluación, ajuste y verificación) para tareas complejas.
- Tool calling / function calling, con optimización específica para llamadas a herramientas en el dominio financiero.
- Capacidades multimodales: el tag `vision` sugiere entrada de imágenes, aunque no se detallan en la información disponible los detalles del codificador visual.
- Programación general: desarrollo full-stack, depuración y diseño de arquitectura en Python, JavaScript, TypeScript, Go y Rust según la model card.
- Capacidades multilingües: la model card declara 201 idiomas y dialectos, con optimización especial para chino; los idiomas declarados formalmente son zh y en.
- Modo "uncensored" sin moderación de contenido.
- Decodificación especulativa mediante MTP para acelerar la generación.

## Casos de uso

- Análisis financiero y Q&A de dominio: el ajuste incorpora datos y capacidades financieras específicas, lo que lo hace adecuado para consultas sobre mercados, informes y conceptos financieros donde la tolerancia a la alucinación es baja.
- Programación cuantitativa: generación y depuración de estrategias y scripts en Python para backtesting y análisis de datos, aprovechando el soporte de tool calling para invocar librerías y APIs de datos de mercado.
- Asistente local con privacidad de datos: al ejecutarse en una GPU de consumo con ~20 GB de VRAM y sin coste por token en la nube, permite procesar información sensible (datos financieros, documentos internos) sin salir del equipo.
- Agentes multi-paso con tool calling: el mecanismo LOOP y el soporte de function calling permiten construir pipelines donde el modelo descompone una tarea, invoca herramientas, evalúa resultados y corrige el plan antes de responder.
- Generación de código en producción: integrable en pipelines de CI/CD o asistentes de IDE mediante endpoints compatibles con la API de OpenAI, con cobertura de Python, JS, TS, Go y Rust.
- Investigación académica y análisis sin restricciones: el modo uncensored permite discusión abierta de temas que otros modelos rechazan, útil en estudios de sesgo, seguridad o análisis de contenido sensible.
- Despliegue en hardware de consumo: con la cuantización MoziSmartBit de ~15,9 GB, cabe en GPUs de 20-24 GB (por ejemplo, RTX 3090 o RTX 4090) para uso 7×24 en estación de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de benchmarks, pero no se han proporcionado los datos numéricos correspondientes.

## Requisitos de hardware

- VRAM estimada: ~15,9 GB con la cuantización MoziSmartBit según el autor; ~22 GB con Q4_K_M estándar; el repo completo ocupa 47,8 GB (incluye múltiples cuantizaciones).
- GPU recomendadas: el autor indica que funciona en GPUs de consumo con 20 GB de VRAM o más; encajan RTX 3090 (24 GB) y RTX 4090 (24 GB). Para despliegue profesional, A100 o H100 ofrecen margen para contexto largo y mayor throughput, aunque no se proporcionan cifras concretas.
- ¿Cabe en GPU de consumo? Sí, según el autor, en GPUs de 20 GB o más con la cuantización MoziSmartBit.
- Opciones de despliegue: llama.cpp (librería declarada), GGUF compatible con Ollama y otros runners de llama.cpp; el tag `endpoints_compatible` indica compatibilidad con la API de OpenAI. No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. Se menciona decodificación especulativa vía MTP como aceleración, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MoziAI-35B-V3.8 (este) | 35,5B (MoE) | no disponible | Apache-2.0 | GGUF | Ajuste financiero, uncensored, vision, MTP |
| Ornith-1.5-35B-A3B (base) | ~35B (MoE) | no disponible | MIT + Apache-2.0 (según NOTICE) | no disponible | Modelo base sin ajuste financiero ni uncensored |
| Qwen3.5-35B-A3B / Qwen3.6-35B-A3B | ~35B (MoE) | no disponible | Apache-2.0 | no disponible | Arquitectura upstream citada por el autor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo; el ajuste "uncensored" elimina la moderación, lo que puede exponer contenido sesgado, ofensivo o dañino sin filtro.
- Alucinación: el autor afirma que el dominio financiero tiene baja tolerancia a la alucinación y que el modelo supera a modelos generales del mismo tamaño, pero no se aportan benchmarks que lo respalden; en producción financiera debe validarse con fuentes externas.
- Contexto e idioma: la longitud de contexto no está especificada; los idiomas declarados formalmente son zh y en, pese a la afirmación de 201 idiomas, por lo que el rendimiento en castellano no está verificado.
- Licencia: Apache-2.0 permite uso comercial, pero la model card remite a un NOTICE con componentes upstream (Qwen/Gemma Apache-2.0, incrementos Ornith MIT); conviene revisar el NOTICE antes de redistribuir.
- Cuantización propietaria: MoziSmartBit es un algoritmo propio del autor; su compatibilidad con herramientas estándar y su reproducibilidad no están verificadas de forma independiente.
- Marco de razonamiento propietario: los marcadores "moziAI-Think" y "moziAI-Loop" son específicos del ajuste y pueden requerir prompts o plantillas concretas; no se documenta su integración con servidores de inferencia estándar.
- Producción: sin benchmarks publicados ni datos de latencia/throughput, la idoneidad para cargas de producción a gran escala no está demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia referenciada en la model card: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP/blob/main/LICENSE
- README en español citado en la model card: V3.8/README.es.md (ruta relativa dentro del repo del autor)
