# ArchiveStudio/Qwen3-Coder-Next-Base

## Resumen

Qwen3-Coder-Next-Base es un modelo de lenguaje causal de pesos abiertos orientado especificamente a agentes de programacion y desarrollo local, publicado por el equipo Qwen. El repositorio analizado, ArchiveStudio/Qwen3-Coder-Next-Base, es una republicacion de los pesos originales (la propia model card enlaza la licencia y el informe tecnico de Qwen), con 0 descargas y 0 likes en el momento de la consulta y un tamano de repositorio de 159,4 GB.

Tecnicamente se trata de un transformer con atencion hibrida y mezcla de expertos (MoE) de alta esparsidad: 79.674.391.296 parametros totales medidos en los ficheros safetensors (la model card declara 80 B totales, 79 B sin embeddings) y aproximadamente 3 B de parametros activos por token, gracias a un enrutado que activa 10 de 512 expertos mas un experto compartido. La ventana de contexto nativa es de 262.144 tokens (256K), lo que lo situa en la gama alta para tareas de codigo con repositorios completos.

Es relevante ahora porque combina un coste de inferencia bajo (3 B activos) con una ventana de contexto muy larga y capacidades declaradas de tool calling, adaptacion a scaffolds y deteccion y recuperacion de errores. La contrapartida importante es que se trata de un modelo en fase de preentrenamiento (base), no de un modelo instruido, por lo que su uso directo requiere post-entrenamiento o tecnicas de prompting sobre completado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion hibrida (Gated DeltaNet + Gated Attention) y MoE de alta esparsidad |
| Parametros totales | 79.674.391.296 (~79,67 B) medidos en safetensors; la model card declara 80 B totales y 79 B sin embeddings |
| Parametros activos | ~3 B por token (10 de 512 expertos + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens nativos (256K) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | La model card declara soporte para mas de 370 lenguajes; los metadatos de HuggingFace indican "no disponibles" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, arquitectura qwen3_next) |
| Dimension oculta | 2.048 |
| Numero de capas | 48, con layout hibrido 12 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE)) |
| Atencion con compuerta (Gated Attention) | 16 cabezas Q, 2 cabezas KV, dimension de cabeza 256, dimension RoPE 64 |
| Gated DeltaNet | 32 cabezas de atencion lineal para V, 16 para QK, dimension de cabeza 128 |
| Mixture of Experts | 512 expertos, 10 activados, 1 compartido, dimension intermedia de experto 512 |
| Etapa de entrenamiento | Preentrenamiento (modelo base, sin modo thinking) |
| Fecha de publicacion en el hub | 2026-09-20 |
| Tamano del repositorio | 159,4 GB |

## Arquitectura y entrenamiento

El modelo emplea una disposicion hibrida de 48 capas que alterna dos tipos de bloque. La mayor parte de la profundidad usa Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente cuyo coste de inferencia es constante respecto a la longitud de secuencia. Cada cuatro capas se intercala un bloque de Gated Attention clasica (16 cabezas Q y solo 2 cabezas KV, con dimension de cabeza 256 y RoPE de 64), que aporta recuperacion exacta de informacion a larga distancia. Todas las capas incorporan una capa MoE con 512 expertos, 10 activos y 1 compartido, con dimension intermedia de 512 por experto. Esta combinacion reduce drasticamente el coste de la cache KV (solo las capas de atencion completa almacenan K y V) y permite sostener 256K tokens de contexto con un consumo de memoria mucho menor que un transformer denso equivalente.

En cuanto a los datos, la model card indica que fue entrenado sobre corpora "muy diversos y de amplia cobertura", con contexto nativo de 256K y cobertura de mas de 370 lenguajes, pero no detalla el numero de tokens, la composicion del dataset ni la mezcla de idiomas. La etapa declarada es exclusivamente de preentrenamiento: no se mencionan fases de RLHF, DPO u otra alineacion, y el modelo no genera bloques `<think></think>` (solo admite modo no-thinking). La model card describe capacidades agenticas (tool calling, adaptacion a scaffolds y plantillas, deteccion y recuperacion de errores) como resultado de la receta de entrenamiento, si bien esas capacidades, al tratarse de un modelo base, no estan alineadas para uso conversacional directo. Los parametros de muestreo recomendados son `temperature=1.0`, `top_p=0.95` y `top_k=40`.

## Capacidades

- Generacion de texto y completado de codigo en una amplia variedad de lenguajes de programacion, en modo no-thinking.
- Razonamiento multi-paso sobre contextos muy largos (hasta 262.144 tokens) gracias a la atencion hibrida.
- Tool calling / function calling: la model card lo presenta como una de sus capacidades centrales, orientada a agentes.
- Adaptacion a scaffolds y plantillas de agente (scaffold/template adaptation), pensada para integrarse en frameworks de agentes existentes.
- Deteccion y recuperacion de errores durante la ejecucion de tareas de codigo.
- Capacidades multilingues declaradas de mas de 370 lenguajes, sin desglose de calidad por idioma.
- No soporta modo thinking ni genera bloques de razonamiento explicito.
- No dispone de capacidades de vision ni de audio segun la informacion disponible.
- Al ser un modelo base, no esta alineado para seguir instrucciones conversacionales sin post-entrenamiento adicional.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede actuar como columna vertebral de un agente que lee, edita y ejecuta codigo en un repositorio, ya que su ventana de 256K tokens permite incluir ficheros completos, historial de diffs y salida de herramientas sin truncar el contexto.
- Generacion de codigo en produccion: la combinacion de tool calling y adaptacion a scaffolds permite integrarlo en pipelines de CI/CD como generador de parches o de tests, con un coste de inferencia bajo al activar solo 3 B de parametros.
- Analisis de repositorios completos: con 262.144 tokens de contexto nativo se puede cargar un arbol de proyecto mediano y pedir refactorizaciones, deteccion de vulnerabilidades o documentacion cruzada entre modulos.
- Asistente de desarrollo local en estaciones de trabajo: su esparsidad permite desplegarlo con cuantizacion de 4 bits en una o dos GPU de consumo, ofreciendo un copiloto sin dependencia de servicios en la nube.
- Migracion y traduccion entre lenguajes de programacion: el soporte declarado de mas de 370 lenguajes naturales y su contexto largo ayudan a traducir bases de codigo extensas manteniendo coherencia entre ficheros.
- Base para fine-tuning especializado: al ser un modelo de preentrenamiento con licencia Apache 2.0, es adecuado como punto de partida para ajuste supervisado en dominios concretos (por ejemplo, lenguajes internos o convenciones de una empresa).
- Procesamiento de documentacion tecnica extensa: resumen y extraccion de estructura sobre manuales, RFCs o especificaciones que superan la ventana de modelos de 32K o 128K.
- Automatizacion de revision de codigo en pull requests: el modelo puede recibir el diff, el fichero completo y las convenciones del proyecto, y generar comentarios o correcciones con recuperacion de errores iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog y al informe tecnico de Qwen para las evaluaciones, pero no incluye cifras concretas (MMLU, HumanEval, SWE-bench u otros) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para los pesos: en BF16/FP16 en torno a 160 GB (159,4 GB de repositorio); en FP8 o INT8 en torno a 80 GB; en cuantizacion de 4 bits, aproximadamente 40-45 GB.
- Cache KV: al usar atencion completa solo en 12 de las 48 capas, con 2 cabezas KV de 256 dimensiones, la cache crece a unos 1.024 valores por capa de atencion y token (2 x 256 para K y V), es decir unos 24 KB por token en FP16. Para 262.144 tokens, el orden de magnitud es de unos 6 GB por secuencia en FP16 (estimacion propia a partir de la configuracion declarada, no un dato publicado).
- GPU recomendadas: 8 x H100 80 GB o 8 x A100 80 GB en BF16; 2 x H100 80 GB para FP8; configuraciones de 4 x H200 para contexto completo con lotes grandes.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en BF16 ni en FP8; en 4 bits los pesos rondan los 40-45 GB, por lo que se necesitan al menos dos GPU de 24 GB o una RTX 6000 Ada / PRO 6000. Alternativamente, llama.cpp puede mantener los expertos en RAM y descargar parte del calculo a CPU, a costa de una caida importante del throughput.
- Opciones de despliegue: vLLM, SGLang y TGI si la version instalada soporta la arquitectura `qwen3_next`; llama.cpp u Ollama requieren convertir los pesos a GGUF, conversion que no se ha publicado en este repositorio (que solo contiene safetensors). El tag `endpoints_compatible` sugiere uso a traves de Inference Endpoints.
- Latencia y throughput: no disponibles. Cabe esperar un throughput alto en relacion con modelos densos de tamano similar, dado que solo se activan unos 3 B de parametros por token, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no han sido verificados contra este repositorio. No se dispone de cifras de rendimiento comparadas.

| Modelo | Parametros totales | Parametros activos | Contexto nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-Next-Base | ~80 B | ~3 B | 262.144 tokens | Apache 2.0 | Pesos safetensors en HuggingFace |
| Qwen3-Coder-480B-A35B | 480 B | 35 B | 262.144 tokens | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3-30B-A3B | ~30 B | ~3 B | 32.768 tokens (extensible a 131.072) | Apache 2.0 | Pesos abiertos en HuggingFace |
| gpt-oss-120b | ~117 B | ~5 B | 131.072 tokens | Apache 2.0 | Pesos abiertos en HuggingFace |

Frente a Qwen3-Coder-480B-A35B, la variante Next ofrece un contexto nativo identico con una decima parte de parametros totales y una decima parte de parametros activos, lo que reduce coste de inferencia y huella de memoria, a cambio de presumiblemente menor capacidad bruta. Frente a Qwen3-30B-A3B, mantiene un coste de activacion similar pero multiplica por ocho la ventana de contexto nativa. Comparado con gpt-oss-120b, el modelo de Qwen activa menos parametros por token y duplica el contexto nativo.

## Limitaciones y advertencias

- Es un modelo base de preentrenamiento: no esta alineado para seguir instrucciones, mantener formato conversacional ni rechazar peticiones peligrosas. Usarlo directamente como asistente produce resultados pobres y puede requerir fine-tuning supervisado.
- No dispone de modo thinking y no genera bloques de razonamiento explicito, lo que limita su uso en tareas que se beneficien de cadena de pensamiento explicita.
- Riesgo de alucinacion de APIs, funciones y librerias inexistentes, especialmente al ser un modelo sin alineacion y con generacion de codigo.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion disponible. Los corpora de mas de 370 lenguajes implican calidad desigual por idioma.
- Idiomas: la model card declara 370+ lenguajes, pero no hay desglose de rendimiento por idioma ni evaluacion publicada; los metadatos del hub no listan idiomas.
- Contexto: los 262.144 tokens son nativos, pero no se documenta la degradacion real de rendimiento a longitudes cercanas al limite (needle-in-a-haystack u otras pruebas).
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza la licencia del repositorio original de Qwen; conviene verificar el fichero LICENSE del repositorio antes de un despliegue comercial.
- Repositorio de terceros: este repositorio pertenece a ArchiveStudio, no a Qwen, y presenta 0 descargas y 0 likes. No hay garantia de que los pesos coincidan bit a bit con los originales; para produccion es recomendable partir del repositorio oficial.
- Sin cuantizaciones publicadas ni versiones GGUF en este repositorio, el despliegue en hardware de consumo exige conversion propia.
- No se dispone de resultados de benchmarks publicados en la informacion proporcionada, por lo que las decisiones de adopcion no pueden basarse en comparativas verificadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArchiveStudio/Qwen3-Coder-Next-Base
- Blog de Qwen: https://qwen.ai/blog?id=qwen3-coder-next
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Informe tecnico (PDF): https://github.com/QwenLM/Qwen3-Coder/blob/main/qwen3_coder_next_tech_report.pdf
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Licencia referenciada en la model card: https://huggingface.co/Qwen/Qwen3-Coder-Next-Base/blob/main/LICENSE

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces listados provienen de la model card y de los metadatos del repositorio.
