# schwyzquants/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a tareas de programacion y flujos de trabajo agenticos, construido sobre Kimi K2.6 por Moonshot AI. El modelo declara 1 billon de parametros totales con 32.000 millones activos por token, una ventana de contexto de 256.000 tokens y un codificador de vision MoonViT de 400 millones de parametros, lo que lo situa en la categoria de modelos multimodales de gran escala para ingenieria de software.

Su propuesta principal es la mejora en tareas de codificacion de horizonte largo ("long-horizon") en entornos reales: la model card reporta un incremento de 50,9 a 62,0 en su benchmark interno Kimi Code Bench v2 respecto a K2.6, y una reduccion aproximada del 30% en el consumo de tokens de razonamiento (thinking tokens) en comparacion con su predecesor. Tambien mejora en pruebas de uso de herramientas y agentes (MCP Atlas, MCP Mark Verified, Kimi Claw 24/7 Bench).

Es relevante ahora porque combina tres ejes que la industria esta priorizando en 2026: eficiencia de inferencia mediante arquitectura MoE dispersa (8 de 384 expertos por token), contexto muy largo (256K) para razonamiento sobre repositorios completos, y capacidades agenticas nativas con soporte multimodal. La ficha corresponde al repositorio `schwyzquants/Kimi-K2.7-Code` en HuggingFace, que reproduce la model card de Moonshot AI; conviene verificar la procedencia antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion MLA y SwiGLU |
| Parametros totales | 1 billon (1.026.879.376.368 segun safetensors) |
| Parametros activos | 32.000 millones por token |
| Longitud de contexto | 256K tokens (262.144 en la configuracion de evaluacion) |
| Tipos de cuantizacion | No disponible en detalle; el tag `compressed-tensors` indica pesos comprimidos/cuantizados, sin esquema declarado |
| Idiomas soportados | No disponible |
| Licencia | Modified MIT (`license: other`, `license_name: modified-mit`) |
| Formato de pesos | Safetensors (con `custom_code` de transformers, arquitectura `kimi_k25`) |
| Capas | 61 (1 densa) |
| Dimension oculta de atencion | 7168 |
| Dimension oculta MoE por experto | 2048 |
| Cabezas de atencion | 64 |
| Expertos totales / seleccionados por token / compartidos | 384 / 8 / 1 |
| Tamano de vocabulario | 160K |
| Codificador de vision | MoonViT, 400 millones de parametros |
| Tamano del repositorio | 595,2 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso de tipo MoE con 61 capas (una de ellas densa) y atencion Multi-head Latent Attention (MLA), mecanismo que comprime las representaciones de clave-valor y reduce el coste de memoria de la cache KV en contextos largos, algo critico con una ventana de 256K tokens. El enrutamiento selecciona 8 expertos de un total de 384 por token, mas un experto compartido, con una dimension oculta de 2048 por experto y una funcion de activacion SwiGLU. El modelo incorpora ademas un codificador visual MoonViT de 400 millones de parametros, lo que habilita entradas de imagen y texto.

En cuanto a entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card si indica que K2.7 Code se construye sobre Kimi K2.6 y que el ajuste se ha enfocado en tareas de codificacion agentica de horizonte largo, con una mejora de eficiencia del 30% en tokens de razonamiento. Las evaluaciones reportadas se ejecutaron con el modo thinking activado a traves de Kimi Code CLI, con temperatura 1,0 y top-p 0,95. Kimi Code Bench v2 es un benchmark interno con tareas de ingenieria de software en mas de 10 lenguajes de programacion y stack de produccion (servicios backend, infraestructura, rendimiento e incidencias reales).

## Capacidades

- Generacion de texto y codigo en mas de 10 lenguajes de programacion segun el benchmark interno Kimi Code Bench v2.
- Razonamiento agentico de horizonte largo: resolucion de tareas de ingenieria de software de extremo a extremo con multiples pasos.
- Modo thinking con eficiencia mejorada: aproximadamente un 30% menos de tokens de razonamiento que Kimi K2.6.
- Uso de herramientas y function calling: los resultados en MCP Atlas (76,0) y MCP Mark Verified (81,1) evidencian soporte del protocolo MCP y de llamadas a herramientas.
- Ejecucion autonoma prolongada: el benchmark Kimi Claw 24/7 Bench mide agentes operando de forma continua.
- Capacidades multimodales de imagen y texto gracias al codificador MoonViT (400M de parametros), coherente con el pipeline `image-text-to-text`.
- Ventana de contexto de 256K tokens, adecuada para razonamiento sobre bases de codigo extensas o sesiones agenticas largas.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).

## Casos de uso

- Refactorizacion de repositorios completos: con 256K tokens de contexto, el modelo puede ingerir modulos extensos y proponer cambios coherentes entre ficheros sin perder referencias cruzadas.
- Agentes de resolucion de incidencias en produccion: el rendimiento en Kimi Claw 24/7 Bench y MCP Atlas lo hace adecuado para agentes que consultan logs, tickets y sistemas internos mediante MCP y aplican parches.
- Integracion en pipelines de CI/CD: soporta tool calling, por lo que puede conectarse a herramientas de build, linters y suites de tests para diagnosticar fallos y proponer correcciones automaticas.
- Asistente de desarrollo en IDE: generacion y explicacion de codigo con razonamiento en modo thinking, con menor coste de tokens que K2.6, lo que abarata sesiones interactivas largas.
- Migracion y modernizacion de codigo legacy: la combinacion de contexto largo y capacidades agenticas permite traducir bases de codigo entre lenguajes o frameworks por fases.
- Revision de codigo automatizada en pull requests: analisis de diffs con contexto del resto del repositorio y verificacion de convenciones del proyecto.
- Automatizacion de tareas de infraestructura: el benchmark MLS Bench Lite (35,1) apunta a tareas de sistemas y machine learning engineering, como ajuste de configuraciones de despliegue.
- Analisis de capturas e interfaces: el codificador de vision permite interpretar maquetas, diagramas o capturas de error para generar codigo o diagnosticar problemas de UI.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo (modo thinking, Kimi Code CLI, temperatura 1,0, top-p 0,95, contexto de 262.144 tokens):

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros estandarizados) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 2,05 TB solo para pesos, inviable en una unica GPU; requiere despliegue multi-nodo.
- VRAM estimada en FP8/INT8: alrededor de 1,03 TB de pesos, mas cache KV; del orden de 13-16 aceleradores de 80 GB.
- VRAM estimada si se usa el repositorio tal cual (595,2 GB de safetensors, en torno a 4,6 bits por parametro de media): aproximadamente 8 GPU de 80 GB como minimo para los pesos, antes de sumar cache KV y overhead.
- GPU recomendadas: H100 80 GB, H200 o A100 80 GB en configuracion multi-GPU o multi-nodo. No se dispone de datos de latencia ni throughput publicados.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o RTX 5090 (32 GB) no pueden alojar el modelo ni siquiera con cuantizacion agresiva a 2-3 bits.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el repositorio incluye `custom_code` para la arquitectura `kimi_k25`). El soporte en vLLM, SGLang, TensorRT-LLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible; dadas la arquitectura MoE con MLA y la presencia de codigo personalizado, conviene verificarlo antes de planificar el despliegue.
- La atencion MLA reduce el consumo de cache KV respecto a atencion estandar, pero no se publican cifras concretas de memoria por token de contexto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1 billon totales / 32.000 millones activos (MoE) | 256K | Modified MIT | Pesos abiertos en HuggingFace | Referencia de la tabla anterior |
| Kimi K2.6 | No disponible (predecesor directo) | No disponible | No disponible | No disponible | Inferior en los 6 benchmarks reportados |
| GPT-5.5 | No disponible | No disponible | Propietaria | API cerrada | Superior en Kimi Code Bench v2, Program Bench, Claw 24/7, MCP Atlas y MCP Mark Verified |
| Claude Opus 4.8 | No disponible | No disponible | Propietaria | API cerrada | Superior en MLS Bench Lite, MCP Atlas y Kimi Code Bench v2; inferior en Program Bench y MCP Mark Verified |

No se dispone de datos suficientes para comparar con otras familias abiertas de tamano similar (por ejemplo alternativas MoE de la competencia), ya que no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio analizado (`schwyzquants/Kimi-K2.7-Code`) es una publicacion de terceros con 0 descargas y 0 likes; la model card reproduce el contenido de Moonshot AI. La procedencia de los pesos no esta verificada y deberia contrastarse con el repositorio oficial `moonshotai`.
- La licencia "Modified MIT" no detalla en la model card que clausulas se modifican respecto a MIT. Es imprescindible revisar el fichero LICENSE antes de un uso comercial.
- Riesgo de alucinacion: no se documentan tasas de error ni estrategias de mitigacion en la informacion disponible.
- Sesgos conocidos: no disponibles; no se publica informacion sobre composicion del dataset ni evaluaciones de sesgo o seguridad.
- Idiomas soportados: no declarados, lo que impide garantizar calidad fuera del ingles y de los lenguajes de programacion cubiertos por los benchmarks.
- Rendimiento por debajo de los modelos propietarios de referencia en la mayoria de benchmarks, con una diferencia notable en MCP Mark Verified (81,1 frente a 92,9 de GPT-5.5).
- Requisitos de hardware extremos: el repositorio ocupa 595,2 GB y el despliegue en BF16 supera los 2 TB, lo que limita el uso a infraestructura multi-GPU.
- El soporte de frameworks de inferencia ampliamente usados (vLLM, llama.cpp, Ollama) no esta confirmado, lo que puede implicar trabajo de integracion adicional.
- Los benchmarks Kimi Code Bench v2, Kimi Claw 24/7 Bench y MLS Bench Lite son internos del fabricante; los resultados no son directamente comparables con evaluaciones estandarizadas de terceros.
- Las condiciones de evaluacion difieren entre modelos (Kimi Code CLI frente a Codex y Claude Code en modo xhigh), lo que puede introducir sesgo en la comparacion.

## Enlaces

- Repositorio en HuggingFace (esta ficha): https://huggingface.co/schwyzquants/Kimi-K2.7-Code
- Repositorio oficial de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Modelo Kimi K2.7 Code oficial (referencia de la model card): https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Licencia: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Pagina del producto Kimi Code: https://www.kimi.com/code
- Web de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai

La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los enlaces recuperados correspondian a contenido no relacionado con inteligencia artificial.
