# hakobuAi/tobu-mtp-head-p

## Resumen

tobu MTP head P es una cabeza de predicción multi-token (MTP) diseñada como borrador para decodificación especulativa sobre el modelo Qwen3.8-Flash-Next. La desarrolla hakobu GmbH y se publica bajo el identificador `hakobuAi/tobu-mtp-head-p`. No es un modelo generativo autónomo: es un componente auxiliar que el motor tobu-dist emplea para proponer tokens que el modelo principal verifica después. Su función es exclusivamente acelerar la decodificación, sin alterar la salida.

El artefacto pesa 2,79 GB en formato GGUF con cuantización UD-IQ4_XS y contiene 2.607.150.848 parámetros totales según los safetensors del repositorio. Deriva del modelo base Qwen/Qwen3.8-Flash-Next mediante un proceso de autodestilación en dos etapas (stage-B) sobre las propias salidas greedy del modelo, y está pensado para usarse junto con la cuantización UD-IQ4_XS de la misma revisión del repositorio de unsloth.

Su relevancia es práctica: en las pruebas del autor, la incorporación de esta cabeza multiplica por más de dos la velocidad de decodificación en tareas de código (de 31,1 a 74,3 tok/s) y en extracción JSON (de 31,1 a 83,7 tok/s) en hardware de consumo, manteniendo salidas bit-idénticas a las del modelo sin MTP. Es, por tanto, una pieza de infraestructura de inferencia más que un modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) sobre transformer del modelo base Qwen3.8-Flash-Next; entrenados `hc_ffn`, el experto compartido y `hc_head` (unos 25 M de parámetros); router, expertos enrutados, atención y LM head congelados |
| Parametros totales | 2.607.150.848 |
| Parametros activos | no disponible (el modelo base es de arquitectura MoE, pero la ficha no detalla sus parámetros activos) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-Flash-Next; en las pruebas se procesan prefills de 8,7k y 36k tokens) |
| Tipos de cuantizacion | UD-IQ4_XS (GGUF); el head se entrena y redondea contra Q8_0 del repositorio de unsloth |
| Idiomas soportados | no disponible oficialmente; los datos de entrenamiento incluyen alemán e inglés |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (`mtp-tobu-p-iq4xs.gguf`, 2,79 GB, sha256 `c0d60e1c2374f292caed86f94018ec1c2fda82556a5b4ee04867bf4f47ec29f0`) |

## Arquitectura y entrenamiento

La cabeza MTP se acopla por detrás de la atención del modelo base y se entrena mediante autodestilación en etapa B (stage-B self-distillation behind the attention). Solo se actualizan tres componentes: `hc_ffn`, el experto compartido y `hc_head`, que suman aproximadamente 25 millones de parámetros. El router, los expertos enrutados, la atención y el LM head permanecen congelados. El entrenamiento consistió en 1 época, 1.450 pasos, batch de 256, tasa de aprendizaje de 5e-5 y 430.000 filas de entrenamiento.

Los datos son exclusivamente públicos y sintéticos. Los objetivos son las propias salidas greedy del modelo (autodestilación), sin datos de clientes, conversaciones privadas ni documentos internos. El corpus se compone de 250 respuestas del modelo a prompts sintéticos (ensayo, relato o correo sobre un tema genérico) en alemán e inglés, con un 30 % con thinking activado, más tres sesiones de agente de código ejecutadas por el propio modelo sobre tareas públicas neutras: un almacén clave-valor con compactación, un formateador de tablas Markdown y un limitador de tasa HTTP. La cabeza se entrenó contra los estados ocultos de la cuantización UD-IQ4_XS de la revisión `766911a6` del repositorio `unsloth/Qwen3.8-Flash-Next-GGUF`, de la que deriva el head compartido Q8_0 de unsloth.

## Capacidades

- Decodificación especulativa: propone tokens candidatos que el modelo principal verifica, acelerando la decodificación sin modificar la salida.
- Preservación bit-idéntica: con esta cabeza, las salidas greedy del motor tobu son exactamente iguales que sin ninguna cabeza MTP (los tres configuraciones produjeron los mismos 7 hashes de salida en el bench).
- Mejora de precisión de borrador en texto en prosa, tareas de agente de código y extracción estructurada.
- Compatible con modo thinking del modelo base (parte de los datos de entrenamiento lo activa).
- Soporte multilingüe limitado al alemán e inglés en los datos de entrenamiento.
- No es un modelo conversacional autónomo: no genera respuestas por sí mismo, solo borradores para verificación.
- No dispone de tool calling, visión, audio ni capacidades de agente propias; estas dependen del modelo base.

## Casos de uso

- Aceleración de servidores de inferencia con tobu-dist: se instala con `./install.sh --head-p` o configurando `TOBU_MTP` y `scripts/serve.sh start`, y reduce la latencia de decodificación en producción sin cambiar las respuestas.
- Generación de código en pipelines de CI/CD: en tareas de código el bench pasa de 31,1 a 74,3 tok/s, lo que abarata la generación de parches y revisiones automáticas en hardware de consumo.
- Extracción de JSON estructurado: con 83,7 tok/s frente a 31,1 sin MTP, es adecuada para tareas de parsing y transformación de documentos a gran escala.
- Refactorización de código asistida: 86,2 tok/s en el escenario de refactor de código, útil para herramientas de edición automática de repositorios.
- Generación de prosa en alemán: 42,4 tok/s en prosa y 42,6 tok/s en respuestas cortas, adecuado para asistentes de redacción en ese idioma.
- Despliegue en hardware de consumo: el bench se ejecuta en un Bosgame M5 con Ryzen AI Max+ 395, Radeon 8060S (gfx1151) y 128 GB, con perfil de 85 W, lo que demuestra viabilidad en equipos de escritorio sin GPUs de centro de datos.
- Evaluación comparativa de cabezas MTP: sirve para medir la ganancia de una cabeza afinada frente a la cabeza compartida de unsloth en distintos dominios (prosa, agente, JSON).

## Benchmarks y rendimiento

Precisión top-1 de borrador offline sobre datos reservados (tras redondeo Q8_0):

| Conjunto de datos | Cabeza unsloth | head P |
|---|---:|---:|
| Prosa | 72,6 % | 76,9 % |
| Agente: almacén clave-valor | 87,4 % | 88,6 % |
| Agente: tablas Markdown | 86,9 % | 88,2 % |
| Agente: limitador de tasa | 91,0 % | 91,6 % |

Decodificación online con tobu-dist v0.8.0 en Bosgame M5 (Ryzen AI Max+ 395, Radeon 8060S / gfx1151, 128 GB), perfil de 85 W, greedy, mediana de 4 ejecuciones tras un calentamiento descartado:

| tok/s | Sin MTP | Cabeza unsloth | head P |
|---|---:|---:|---:|
| Decodificación: código | 31,1 | 73,5 | 74,3 |
| Decodificación: refactor de código | 31,2 | 86,9 | 86,2 |
| Decodificación: extracción JSON | 31,1 | 80,2 | 83,7 |
| Decodificación: prosa alemana | 31,0 | 40,4 | 42,4 |
| Decodificación: respuesta corta alemana | 31,2 | 39,9 | 42,6 |
| Prefill en frío 8,7k / 36k tokens | 1.706 / 1.669 | 1.635 / 1.596 | 1.637 / 1.601 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas de calidad del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 2,79 GB; debe sumarse la memoria del modelo base Qwen3.8-Flash-Next en UD-IQ4_XS, no especificada en la información disponible.
- GPU recomendadas: el bench se ejecuta en una Radeon 8060S (gfx1151) integrada en Ryzen AI Max+ 395 con 128 GB de memoria unificada; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: sí, al menos en el equipo del bench (Bosgame M5, 128 GB, perfil de 85 W); no hay datos para GPUs de consumo con menos memoria.
- Opciones de despliegue: exclusivamente el motor tobu-dist (GitHub `hakobu/tobu-dist`), mediante `./install.sh --head-p` o la variable `TOBU_MTP`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 74,3 tok/s en código, 86,2 tok/s en refactor, 83,7 tok/s en JSON, 42,4 tok/s en prosa alemana; prefill en frío de 1.637 tok/s para 8,7k tokens y 1.601 tok/s para 36k tokens.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Rendimiento (bench del autor) |
|---|---|---|---|---|---|
| tobu MTP head P | Cabeza MTP para decodificación especulativa | 2.607.150.848 (unos 25 M entrenados) | no disponible | qwen-community-1.0 | 76,9 % top-1 en prosa; 74,3 tok/s en código |
| Cabeza MTP de unsloth (`unsloth/Qwen3.8-Flash-Next-GGUF`, rev. 766911a6) | Cabeza MTP compartida, Q8_0 | no disponible | no disponible | qwen-community-1.0 (derivada) | 72,6 % top-1 en prosa; 73,5 tok/s en código |
| Qwen3.8-Flash-Next (modelo base) | Modelo generativo MoE | no disponible | no disponible | qwen-community-1.0 | 31,1 tok/s en código sin MTP |

No se dispone de datos de otras cabezas MTP comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como borrador dentro del motor tobu-dist; no puede usarse con vLLM, llama.cpp, Ollama ni TGI según la documentación disponible.
- Dependencia estricta de la cuantización UD-IQ4_XS de la revisión `766911a6` del repositorio de unsloth; la cabeza se entrenó contra sus estados ocultos y no se garantiza su funcionamiento con otras cuantizaciones o revisiones.
- Los datos de entrenamiento son sintéticos y autogenerados (250 respuestas de prosa y 3 sesiones de agente), lo que limita la cobertura de dominios y puede reducir la precisión de borrador fuera de los escenarios evaluados.
- Idiomas: solo se documentan alemán e inglés en el entrenamiento; no hay información sobre otros idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser autodestilación del modelo base, podría heredar sus sesgos.
- Riesgo de alucinación: no aplica a la calidad de la salida, ya que el modelo principal verifica cada token; el bench confirma salidas bit-idénticas.
- Licencia: Qwen Community License 1.0, con posibles restricciones de uso comercial recogidas en el texto completo de la licencia; debe revisarse antes de un despliegue en producción.
- Repositorio con 0 descargas y 2 likes en el momento de la consulta; no hay evidencia de adopción ni validación independiente de los resultados del autor.
- Sin datos publicados de benchmarks de calidad del modelo base (MMLU, HumanEval, GSM8K) en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/hakobuAi/tobu-mtp-head-p
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/812d96e10a0dd82b69d749e68693698cf6c36daa/LICENSE
- Repositorio de cuantizaciones de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Motor tobu-dist: https://github.com/hakobu/tobu-dist
- Contacto: david.mueller@hakobu.de (hakobu GmbH)
