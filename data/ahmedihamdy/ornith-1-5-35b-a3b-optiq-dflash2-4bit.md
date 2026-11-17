# ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit

## Resumen

Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit es una distribucion cuantizada a 4 bits del modelo Ornith 1.5 35B-A3B, un transformer de tipo mezcla de expertos (MoE) con capacidades multimodales (texto e imagen) desarrollado por ornith-ai. Este paquete concreto, publicado por el usuario ahmedihamdy, empaqueta en un unico repositorio los pesos OptiQ de 4 bits del modelo principal junto con su modelo borrador DFlash2 para decodificacion especulativa, de modo que una sola descarga proporciona ambos componentes. El objetivo es acelerar la inferencia en Apple Silicon, en concreto en equipos con GPU de la familia M5.

El modelo principal cuenta con 34.660.608.768 parametros totales (aproximadamente 35B) y activa 8 de sus 256 expertos por token, lo que supone unos 3B de parametros activos. Soporta una longitud de contexto de 262.144 tokens, razonamiento previo a la respuesta, llamadas a herramientas y entrada de imagenes. La cuantizacion a 4 bits reduce el peso del repositorio a unos 24,6 GB, lo que lo hace viable en Macs con alrededor de 24 GB de memoria dedicada al modelo.

La relevancia de esta ficha radica en que combina tres tecnicas poco habituales en un solo artefacto: cuantizacion de precision mixta (OptiQ), decodificacion especulativa con arbol de borradores (DFlash2) y kernels especificos para la GPU M5. Segun la model card, esto produce una aceleracion de decodificacion de entre 1,24 y 1,3 veces en un M5 Pro, manteniendo que cada token aceptado es una eleccion propia del modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) multimodal, con decodificacion especulativa DFlash2 |
| Parametros totales | 34.660.608.768 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B (8 de 256 expertos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits con precision mixta (OptiQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35B de parametros totales y aproximadamente 3B activos por token, distribuidos en 256 expertos de los cuales se seleccionan 8 por cada token procesado. La variante qwen3_5_moe indica que la arquitectura deriva de la familia Qwen 3.5 MoE. El modelo es multimodal: procesa texto e imagenes dentro del mismo pipeline image-text-to-text, y genera razonamiento explicito antes de la respuesta final.

Esta distribucion concreta no reentrena ni recuantiza el modelo: segun la model card, los nueve archivos de pesos son los originales de sus dos revisiones de origen (mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit y jzinno/Ornith-1.5-35B-A3B-DFlash2), y se incluye un archivo astronomical-build.json con el tamano y el SHA-256 de cada archivo para verificacion. La innovacion tecnica reside en la decodificacion especulativa: un modelo borrador propone 3 tokens por ronda en forma de arbol, el modelo principal verifica las cuatro filas en un solo paso y conserva cada token con el que esta de acuerdo mas uno propio, de modo que cada ronda puede rendir hasta 4 tokens. Para conversaciones largas, a partir de 2.048 tokens, la atencion del arbol usa un kernel escrito para la GPU M5 que lee la conversacion una sola vez para las cuatro filas; a 64k tokens tarda 15,1 ms frente a 27,9 ms de la ruta general. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: produce una cadena de pensamiento antes de la respuesta final (modo thinking desactivable).
- Comprension de imagenes: pipeline image-text-to-text, admite preguntas sobre fotografias y contenido visual.
- Llamadas a herramientas (tool calling / function calling): integrable con clientes que hablan la API de OpenAI o Anthropic.
- Uso como agente: la model card documenta el lanzamiento de agentes de codigo (claude, codex, opencode) sobre el modelo mediante el comando `astronomical launch`.
- Conversaciones de contexto largo: hasta 262.144 tokens, con aceleracion especifica del kernel de atencion del arbol a partir de 2.048 tokens.
- Capacidades multilingues: limitadas al ingles segun la metadata del repositorio.
- Decodificacion especulativa integrada: el borrador DFlash2 viaja dentro del repositorio y se activa automaticamente al cargar el modelo.
- Ejecucion local y privada: pensado para que nada de lo que se escribe salga del equipo.

## Casos de uso

- Asistencia conversacional local en Mac: el modelo gestiona dialogos multi-turno de hasta 262.144 tokens manteniendo la privacidad, ya que todo el procesamiento ocurre en el equipo del usuario.
- Agente de codigo en terminal: mediante `astronomical launch claude`, `codex` u `opencode`, el modelo actua como backend de un agente de programacion que lee archivos, ejecuta comandos y aplica cambios, aprovechando el tool calling y el contexto largo para mantener el estado del repositorio.
- Analisis de imagenes en flujos de trabajo personales: con `astronomical respond "What is in this image?" --image photo.png`, se pueden describir, clasificar o extraer informacion de fotografias sin subirlas a un servicio externo.
- Sustitucion de API en herramientas existentes: cualquier cliente compatible con la API de OpenAI o Anthropic puede apuntar a la API local de Astronomical y usar este modelo como backend, lo que permite reutilizar integraciones ya existentes.
- Prototipado de aplicaciones con razonamiento paso a paso: el modo thinking permite depurar cadenas de razonamiento en tareas de matematicas o logica antes de integrar el modelo en produccion.
- Procesamiento de documentos extensos con imagenes: combinando contexto de 262k tokens y entrada visual, se pueden analizar informes, capturas o diagramas junto con su texto asociado en una sola peticion.
- Evaluacion de tecnicas de decodificacion especulativa: investigadores pueden medir el impacto del arbol DFlash2 y de los kernels M5 comparando este build con el OptiQ plano en el mismo equipo.

## Benchmarks y rendimiento

La model card solo publica mediciones de velocidad de decodificacion, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros).

| Medicion | Valor |
|---|---|
| Aceleracion con borrador en M5 Pro (thinking off) | 1,24 a 1,3 veces frente a decodificacion plana |
| Tokens propuestos por ronda del borrador | 3 |
| Tokens maximos por ronda tras verificacion | 4 (3 aceptados mas 1 propio) |
| Latencia de atencion del arbol a 64k tokens | 15,1 ms (frente a 27,9 ms de la ruta general) |
| Umbral de activacion del kernel M5 | 2.048 tokens de conversacion |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: alrededor de 24 GB de memoria de modelo para velocidad completa; el repositorio ocupa aproximadamente 24,6 GB en disco (unos 23 GB de descarga).
- GPU recomendadas: Apple Silicon con GPU de la familia M5 para aprovechar los kernels de decodificacion especulativa; en Macs sin GPU M5 el modelo funciona pero decodifica token a token como el build OptiQ plano.
- Compatibilidad con consumer GPU: si, en equipos Apple Silicon; no se documenta soporte para GPU NVIDIA o AMD en esta distribucion.
- Memoria insuficiente: Astronomical puede mantener parte de los expertos en el SSD y leerlos bajo demanda, lo que permite ejecutar el modelo en Macs con bastante menos memoria a costa de velocidad.
- Opciones de despliegue: aplicacion Astronomical (macOS 14 o posterior) y su CLI `astronomical`; API local compatible con OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este build MLX.
- Latencia y throughput: la model card solo aporta la aceleracion relativa (1,24-1,3x) y las latencias del kernel de atencion; no se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit | 35B totales, ~3B activos | 262.144 | Texto e imagen | Apache 2.0 | Hugging Face, MLX |
| mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit | 35B totales, ~3B activos | 262.144 (segun modelo base) | Texto e imagen | Apache 2.0 | Hugging Face, MLX |
| jzinno/Ornith-1.5-35B-A3B-DFlash2 | No disponible | No disponible | No disponible | No disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion disponible; no se dispone de datos de benchmarks que permitan contrastar el rendimiento con modelos de otras familias.

## Limitaciones y advertencias

- Idiomas: la metadata declara unicamente ingles, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Calidad no medida: no hay benchmarks publicados de MMLU, HumanEval, GSM8K ni similares para este build; la unica metrica publicada es la aceleracion de decodificacion.
- Dependencia de hardware: la aceleracion por decodificacion especulativa requiere GPU de la familia M5; en otros equipos el rendimiento equivale al build OptiQ plano.
- Diferencias de salida: la model card advierte que la salida greedy puede diferir ligeramente de la decodificacion plana porque algunos kernels matriciales redondean de forma distinta al procesar varias filas a la vez.
- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion; como en cualquier LLM, las respuestas deben verificarse en entornos de produccion.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo o seguridad en la documentacion proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de ornith-ai y de los repositorios de origen.
- Madurez del ecosistema: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y depende de la aplicacion Astronomical (version 0.2.116 o posterior) para aprovechar el borrador integrado.
- Verificacion de integridad: el autor publica hashes SHA-256 de cada archivo, pero la confianza en el build depende de comprobarlos manualmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit
- Modelo base cuantizado: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit
- Modelo borrador DFlash2: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Aplicacion Astronomical: https://getastronomical.com/
- Descargas de Astronomical: https://github.com/aosama/astronomical/releases/latest
- Documentacion de la API local: https://getastronomical.com/local-api.html
