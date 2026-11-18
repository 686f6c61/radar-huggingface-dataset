# ibm-granite/granite-4.2-3b

## Resumen

Granite-4.2-3B es un modelo de lenguaje de tipo decoder-only dense desarrollado por el equipo Granite de IBM, presentado el 25 de agosto de 2026 como la variante compacta de la familia Granite 4.2. Con 3.659.737.600 parámetros reales en safetensors, está afinado a partir de Granite-4.1-3B-Base e incorpora razonamiento nativo mediante cadenas de pensamiento delimitadas por `<think>...</think>`, además de soporte explícito de tool calling y flujos agénticos.

Su principal baza es la relación entre tamaño y capacidades: un modelo de 3B que soporta 128K tokens de contexto de forma nativa (con extensión a 512K), cubre doce idiomas probados y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. La arquitectura emplea Grouped Query Attention con 40 cabezas de atención y 8 KV heads, RoPE con theta de 10.000.000, MLP con SwiGLU de tamaño oculto 8192 y RMSNorm, todo en bfloat16.

El modelo resulta relevante para despliegues en los que el coste por token y la huella de memoria importan: razonamiento con modos conmutables (thinking completo, sin thinking y low-effort), integración en pipelines de agentes con llamadas a funciones y procesamiento de documentos largos en entornos empresariales multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only dense transformer (GraniteForCausalLM), GQA, RoPE, SwiGLU, RMSNorm |
| Parametros totales | 3.659.737.600 |
| Parametros activos | No aplica (modelo dense) |
| Longitud de contexto | 128K nativo; extensión a 512K |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales de arquitectura: 40 capas, tamano de embedding 2560, tamano de cabeza de atencion 64, MLP hidden size 8192, epsilon de RMSNorm 1e-5, embeddings de entrada y salida separados (no tied).

## Arquitectura y entrenamiento

Granite-4.2-3B es un transformer decoder-only dense con Grouped Query Attention: 40 cabezas de atencion y 8 KV heads, lo que reduce el coste de memoria de la cache KV en contextos largos. Usa Rotary Position Embedding con theta de 10.000.000 para sostener ventanas de hasta 128K tokens, MLP con activacion SwiGLU de tamano oculto 8192 y RMSNorm con epsilon 1e-5. Los embeddings de entrada y salida no estan atados, lo que anade parametros respecto a un esquema tied. La precision de referencia es bfloat16.

El modelo parte de Granite-4.1-3B-Base y se afina para incorporar razonamiento nativo con etiquetas `<think>...</think>`, ademas de tool calling aumentado por razonamiento. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO; esa informacion no esta disponible. La innovacion destacable es la conmutacion de modos de pensamiento (completo, sin thinking y low-effort) dentro de un mismo modelo, lo que permite ajustar latencia y profundidad por consulta.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso con cadena de pensamiento nativa en `<think>...</think>`.
- Tres modos de pensamiento conmutables: thinking completo (por defecto), sin thinking y low-effort.
- Generacion de codigo y resolucion de problemas matematicos, apoyadas en el modo de razonamiento.
- Tool calling y function calling, con razonamiento explicito sobre que herramienta invocar y por que.
- Flujos agenticos multi-paso y encadenamiento de llamadas a herramientas.
- Procesamiento de documentos largos y conversaciones multi-turno gracias a la ventana de 128K (extension a 512K).
- Capacidades multilingues en doce idiomas probados: en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue gestionado.

## Casos de uso

- Atencion al cliente automatizada: el modelo mantiene conversaciones multi-turno con historial extenso gracias a los 128K tokens de contexto y responde en el idioma del usuario entre los doce soportados, sin cambiar de modelo por region.
- Agentes con herramientas en produccion: con tool calling aumentado por razonamiento, puede decidir que API invocar en cada paso de un flujo multi-paso (consultas a bases de datos, ticketing, CRM) y justificar la eleccion antes de ejecutar.
- Generacion de codigo en pipelines de CI/CD: el modo thinking mejora la resolucion de tareas de refactorizacion y correccion de errores; el modo low-effort reduce la latencia cuando solo se requiere autocompletado o generacion de tests.
- Analisis de documentos largos: contratos, informes o expedientes de decenas de miles de tokens caben en la ventana nativa, con extension a 512K para casos extremos, sin necesidad de troceado agresivo.
- Asistentes de razonamiento matematico y logico: el chain-of-thought integrado permite resolver problemas de varios pasos y explicar el procedimiento, util en herramientas educativas o de auditoria.
- Despliegue en el borde o en hardware modesto: con 3,6B parametros, es viable en una unica GPU de consumo o en CPU con cuantizacion, lo que habilita asistentes locales con privacidad de datos.
- Enrutamiento y clasificacion multilingue: su cobertura de doce idiomas y su bajo coste por token lo hacen adecuado como primer nivel en arquitecturas de enrutamiento hacia modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 7,3 GB solo para pesos (tamano del repo), mas cache KV y overhead; el tag del repositorio indica 7.3 GB de tamano total.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4 GB para pesos, mas cache KV.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2 GB para pesos, mas cache KV; el coste de la cache KV crece con la longitud de contexto y conviene calcularlo por despliegue.
- GPU recomendadas: A100 y H100 para maxima concurrencia y contextos largos; RTX 4090 y RTX 3090 para inferencia en una sola tarjeta en bfloat16.
- GPU de consumo: cabe en tarjetas con 8 GB o mas en bfloat16 y en tarjetas de 4-6 GB con cuantizacion, si bien la informacion proporcionada no detalla los formatos de cuantizacion publicados.
- Opciones de despliegue: transformers de forma nativa; el ecosistema habitual (vLLM, llama.cpp, Ollama, TGI) es compatible con arquitecturas decoder-only de este tipo, aunque la informacion proporcionada no confirma soporte explicito en cada uno de ellos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite-4.2-3B | 3,66B | 128K (ext. 512K) | Apache 2.0 | Razonamiento nativo con modos conmutables y tool calling |
| Granite-4.2-8B | No disponible en detalle | No disponible | Apache 2.0 | Misma familia, mayor tamano (embedding 4096, 40 capas, 32 cabezas, 8 KV heads) |
| Granite-4.2-30B | No disponible en detalle | No disponible | Apache 2.0 | Misma familia, 64 capas, MLP hidden 32768 |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos de otras familias (por ejemplo, Llama o Qwen de tamano comparable) que permitan una comparacion cuantitativa fiable. Cualquier cifra de benchmark entre familias seria inventada y no se incluye.

## Limitaciones y advertencias

- Sesgos: la model card no documenta evaluaciones de sesgo ni mitigaciones especificas; al entrenarse sobre datos web y corporativos, es esperable que reproduzca sesgos presentes en ellos.
- Alucinacion: como todo modelo generativo, puede producir afirmaciones plausibles pero falsas, especialmente en modo sin thinking y en dominios especializados; el chain-of-thought no garantiza correccion.
- Cobertura idiomatica: solo doce idiomas estan probados; el resto puede funcionar pero sin garantias de calidad.
- Contexto largo: la ventana nativa es de 128K; la extension a 512K debe validarse en el caso concreto, ya que el rendimiento en recuperacion de informacion puede degradarse con la longitud.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero no exime del cumplimiento de la normativa aplicable (proteccion de datos, propiedad intelectual, etc.).
- Produccion: la informacion disponible no incluye datos de latencia, throughput ni resultados de benchmarks, por lo que la evaluacion previa al despliegue debe hacerse con pruebas propias.
- Modos de pensamiento: el modo thinking completo incrementa el numero de tokens generados y, con ello, la latencia y el coste; conviene seleccionar el modo por caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-4.2-3b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Coleccion Granite 4.2 Language Models: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog tecnico: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
