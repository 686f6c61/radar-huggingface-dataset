# IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

El modelo identificado como **IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-GGUF** es una cuantizacion GGUF personalizada, tensor por tensor, del modelo base `empero-ai/Qwen3.8-35B-A3B-Distill`. Lo publica el usuario IsValorum, que actua como `quantized_by`, no como autor del modelo original. Se trata de una arquitectura MoE (Mixture of Experts) dispersa de tipo Qwen3.5-MoE, con 40 capas y 256 micro-expertos, 34.660.610.688 parametros totales y, segun la nomenclatura "A3B" del propio nombre, aproximadamente 3.000 millones de parametros activos por token. El objetivo declarado por el autor es ofrecer fidelidad de cuantizacion de 5-6 bits con una huella de disco de un cuantizado de 3 bits (aproximadamente 13,74 GiB), manteniendo el contexto nativo de 256K tokens.

La relevancia de esta publicacion es practica, no algoritmica: no introduce una arquitectura nueva, sino una receta de cuantizacion mixta orientada a dos escenarios concretos. El primero es el despliegue completo en GPU de 24 GB (RTX 3090, 4090 o 5090) con `-ngl 99` y ventana de 256K. El segundo es la ejecucion con descarga parcial o total a RAM de sistema, donde el autor afirma haber eliminado los bloqueos de dequantizacion AVX2 en CPU sustituyendo codebooks no lineales por expertos de borde en `Q3_K` lineal y elevando los expertos compartidos a `Q5_K` en las 40 capas, con tasas declaradas de +24 a 28 tok/s.

El modelo se distribuye bajo licencia Apache 2.0, soporta 13 idiomas (ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe) y esta etiquetado como compatible con llama.cpp, con cabezal de decodificacion especulativa MTP y proyector multimodal `mmproj` en `Q8_0`. En el momento de la consulta acumula 3.184 descargas y 4 "likes", un nivel de validacion comunitaria todavia bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts dispersa (tag `qwen35moe`), 40 capas, 256 micro-expertos, expertos compartidos (`shexp`) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B (deducido de la nomenclatura "A3B" del nombre; no confirmado en la informacion disponible) |
| Longitud de contexto | 256K tokens (segun el autor; soporte nativo indicado para llama.cpp) |
| Tipos de cuantizacion | GGUF con mezcla por tensor: `IQ3_XXS` (expertos nucleares 10-29), `Q3_K` (expertos de borde 0-9 y 30-39), `Q5_K` (experto compartido, 40 capas), `Q4_K` en `q/k/v` y `Q6_K` en la salida de atencion, `Q8_0` en las puertas de atencion (30 capas), `Q6_K` en `output.weight`, `F32` en los routers (`gate_inp`), mas `Q8_0` para el proyector `mmproj` y el cabezal `mtp` |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 17,4 GB con artefactos adicionales (`mmproj`, `mtp`) |
| Tarea | text-generation (conversacional, razonamiento) |
| Modelo base | empero-ai/Qwen3.8-35B-A3B-Distill |
| Modo de razonamiento | Si (etiquetas `<think>` mencionadas por el autor) |
| Fecha de publicacion | 17 de septiembre de 2026 (creado); ultima actualizacion el 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base `empero-ai/Qwen3.8-35B-A3B-Distill`: la model card facilitada corresponde al cuantizado, no al modelo original, y no documenta numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o alguna fase de razonamiento por refuerzo. Lo unico deducible es que se trata de un "distill" (destilacion) sobre una arquitectura MoE de la familia Qwen3.5, con 40 capas y 256 micro-expertos, y que incorpora un cabezal de Multi-Token Prediction (MTP) que actua como modelo borrador para decodificacion especulativa.

La innovacion tecnica real de esta publicacion reside en la receta de cuantizacion, aplicada tensor por tensor. Segun el autor, los routers (`gate_inp`) se mantienen integramente en `F32` sin comprimir para evitar deriva de enrutamiento; el cabezal de salida (`output.weight`) se protege en `Q6_K`; las puertas de atencion de 30 capas se guardan en `Q8_0`; los expertos nucleares (capas 10-29) se mantienen en `IQ3_XXS` o `IQ3_S`; los expertos de borde (capas 0-9 y 30-39) se sustituyen por `Q3_K` lineal optimizado para SIMD; y el experto compartido sube a `Q5_K` en las 40 capas. El autor afirma que esto evita los bloqueos de dequantizacion AVX2 en CPU y mejora el streaming desde RAM de sistema. Adicionalmente, el cabezal MTP en `Q8_0` permite decodificacion especulativa rapida y el `mmproj` en `Q8_0` habilita vision con OCR de latencia baja. Se menciona el uso de `imatrix` en el etiquetado, aunque no se detalla su metodologia exacta de calibracion en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de hasta 256K tokens.
- Modo de razonamiento explicito, con bloques `<think>` citados por el autor como parte del flujo de inferencia.
- Razonamiento de multiples pasos y cadenas de pensamiento largas, gracias al diseno MoE de parametros activos reducidos y contexto extenso.
- Generacion y comprension de codigo; el autor menciona explicitamente la correccion de "corchetes de codigo" como metrica de calidad frente a cuantizados planos de 3 bits.
- Capacidades multimodales de vision a traves del proyector `mmproj` en `Q8_0`, con soporte de OCR declarado por el autor.
- Decodificacion especulativa mediante cabezal MTP dedicado en `Q8_0`.
- Soporte multilingue en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Compatibilidad con llama.cpp y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: **no disponible** en la informacion proporcionada; no se documenta explicitamente.
- Capacidades de agente autonomo: **no disponible** en la informacion proporcionada.
- Capacidades de audio: **no disponible** en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos en local: con 256K tokens de contexto, el modelo permite procesar contratos, expedientes o informes completos sin troceado, algo relevante para despachos juridicos o consultoras que necesitan confidencialidad y no pueden enviar datos a APIs externas.
- Asistente de codigo en estacion de trabajo de 24 GB: el modelo cabe completo en una RTX 3090 o 4090 con `-ngl 99`, lo que permite autocompletado, refactorizacion y explicacion de repositorios enteros sin coste por token.
- OCR y extraccion estructurada de documentos: el proyector `mmproj` en `Q8_0` cargado en VRAM permite leer facturas, formularios o capturas y devolver JSON estructurado con latencia baja, mientras los pesos principales pueden residir en RAM.
- Razonamiento sobre bases de conocimiento largas en hardware de gama media: el modo de streaming desde RAM de sistema (DDR4 o DDR5) permite ejecutar el modelo en equipos sin GPU de 24 GB, con tasas declaradas de 24 a 28 tok/s, adecuado para analisis batch nocturnos.
- Despliegue en sobremesa o estacion de trabajo de investigacion: al ser un GGUF de llama.cpp, se integra en pipelines locales de evaluacion, generacion de datasets sinteticos o experimentos de prompting sin dependencia de nube.
- Traduccion y localizacion multilingue: con 13 idiomas soportados cubre los pares mas demandados en comercio internacional (es, en, de, fr, pt, it, zh, ja, ko, ar), util para equipos de localizacion que necesitan preprocesado masivo.
- Chatbot de atencion al cliente autoalojado: el contexto de 256K permite arrastrar el historial completo de una incidencia sin resumen intermedio, y la licencia Apache 2.0 facilita su integracion comercial.
- Generacion de codigo en CI/CD: **no confirmado**: aunque el modelo genera codigo, no se documenta soporte verificado de tool calling, por lo que su integracion en pipelines automatizados requeriria validacion adicional por parte del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato empirico aportado por el autor es una medicion de perplejidad sobre WikiText-2, junto con cifras de throughput declaradas:

| Metrica | Valor | Condiciones declaradas |
|---|---|---|
| Perplejidad WikiText-2 (GGUF cuantizado) | 5,3952 ± 0,1246 | Evaluada directamente sobre el binario GGUF, contexto 2048, 10 fragmentos |
| Perplejidad WikiText-2 (base sin cuantizar, referencia) | ~5,34 | Referencia citada por el autor |
| Delta de perplejidad | ≈ +0,05 | Respecto al modelo sin cuantizar |
| Throughput con descarga a RAM de sistema | +24 a 28+ tok/s | Dependiente de CPU y ancho de banda de memoria (DDR4 dual-channel o DDR5 6000+ MT/s) |
| Huella del cuantizado principal | ~13,74 GiB | Build V2.1 |
| Tamano total del repositorio | 17,4 GB | Incluye `mmproj` y cabezal `mtp` |

Estos datos proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para el cuantizado principal: aproximadamente 13,74 GiB de pesos, mas overhead de contexto KV. Para 256K tokens de contexto se requiere VRAM adicional no cuantificada en la informacion disponible.
- Descarga completa en GPU: el autor indica que basta con 24 GB o mas de VRAM y `-ngl 99`. GPUs mencionadas explicitamente: RTX 3090, RTX 4090 y RTX 5090.
- Caben en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090, 5090) con descarga completa. En GPUs de 16 GB o menos, la informacion disponible no confirma un ajuste completo; requeriria descarga parcial a RAM.
- Modo de streaming desde RAM: disenado para ejecutarse parcial o totalmente desde memoria de sistema, incluso con ventanas de contexto de 160K a 256K. El autor recomienda DDR4 dual-channel o DDR5 a 6000+ MT/s.
- Componentes que el autor recomienda cargar siempre en VRAM: el proyector multimodal `mmproj` en `Q8_0` y el cabezal borrador MTP en `Q8_0`, para decodificacion especulativa y OCR sin latencia.
- Opciones de despliegue: llama.cpp (formato nativo), herramientas compatibles con endpoints. Se menciona Unsloth Studio en el proceso de cuantizacion. No se documenta soporte de vLLM, TGI ni Ollama en la informacion proporcionada.
- Latencia y throughput: 24 a 28+ tok/s en modo streaming desde RAM, segun el autor. No se aportan cifras de throughput para el modo de descarga completa en VRAM.
- Riesgo conocido: el autor advierte que los cuantizados con codebooks no lineales pueden provocar bloqueos de dequantizacion AVX2 en CPU; esta build afirma haberlos eliminado.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de terceros en la informacion proporcionada. La unica comparativa disponible es la que ofrece el propio autor frente a otras recetas de cuantizacion del mismo modelo base:

| Build | Expertos nucleares (10-29) | Expertos de borde (0-9, 30-39) | Experto compartido | Atencion completa | Puertas de atencion | Cabezal de salida | Routers | Tamano | Impacto declarado |
|---|---|---|---|---|---|---|---|---|---|
| APEX-I-MiniPlus V2.1 (este modelo) | `IQ3_XXS` | `Q3_K` (10 capas) | `Q5_K` (40 capas) | `Q4_K` (q/k/v) + `Q6_K` (output) | `Q8_0` | `Q6_K` | `F32` | ~13,74 GiB | Sin bloqueos AVX2; +24 a 28+ tok/s en streaming desde RAM; decodificacion especulativa MTP |
| APEX Mini generico de la comunidad | `IQ2_S` (2,50 bpw) | `Q3_K` (solo 5 capas) | `Q4_K` / `Q3_K` | `Q3_K` | Comprimidas | `Q3_K_M` | Comprimidos | ~12,5 GB | Errores de sintaxis, indentacion de codigo rota, perplejidad alta en `<think>` |
| Cuantizados planos de 3 bits | 3 bits uniforme | 3 bits uniforme | 3 bits uniforme | 3 bits uniforme | 3 bits uniforme | 3 bits uniforme | 3 bits uniforme | No disponible | Rendimiento inferior al de la receta APEX-I-MiniPlus, segun el autor |

Comparacion con alternativas de la misma categoria (otros modelos MoE de ~35B totales y ~3B activos, o cuantizados del mismo base): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) publicados en la informacion disponible; toda la evidencia de calidad se limita a una medicion de perplejidad sobre WikiText-2 aportada por el propio autor.
- La model card esta redactada en un registro marcadamente promocional ("The Definitive Frontier MoE", "24GB Miracle", "Blistering"). Las afirmaciones de rendimiento deben tratarse como no verificadas de forma independiente.
- La validacion comunitaria es muy baja: 4 "likes" frente a 3.184 descargas en el momento de la consulta. No hay evaluaciones de terceros citadas mas alla de una referencia a "Occamy V2" cuyo contenido no se ha facilitado.
- El rendimiento real depende criticamente del hardware: las cifras de 24-28 tok/s estan condicionadas a la arquitectura de CPU y al ancho de banda de memoria (DDR4 dual-channel o DDR5 6000+ MT/s). En equipos con memoria mas lenta el rendimiento puede degradarse de forma notable.
- Existe riesgo de alucinacion inherente a los modelos generativos, agravado por la cuantizacion de 3 bits en los expertos de borde. En tareas de razonamiento largo o generacion de codigo conviene validar las salidas.
- La cuantizacion de 3 bits introduce una perdida medible: el propio autor reporta un delta de perplejidad de aproximadamente +0,05 respecto al modelo sin cuantizar. Es pequeno, pero no nulo.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion del modelo base, por lo que no es posible evaluar riesgos de sesgo de forma informada.
- Licencia Apache 2.0 declarada para este cuantizado, lo que en principio permite uso comercial. Sin embargo, no se ha verificado la licencia del modelo base `empero-ai/Qwen3.8-35B-A3B-Distill`, que podria imponer condiciones adicionales. Conviene comprobarla antes de un despliegue en produccion.
- El soporte de tool calling y de flujos de agente no esta documentado ni confirmado; asumirlo podria romper integraciones automatizadas.
- La fecha de publicacion indicada (septiembre de 2026) es posterior al conocimiento de referencia habitual, por lo que existe poca trazabilidad externa sobre el modelo base y su ecosistema.
- El modelo esta etiquetado como `text-generation`; el uso multimodal depende del artefacto `mmproj` incluido, cuya calidad no se ha verificado de forma independiente.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Coleccion APEX-I-MiniPlus V2.1 en HuggingFace: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente paginas institucionales de la Unidad para las Victimas de Colombia y de la Rama Judicial de Colombia, sin relacion con el modelo.
