# openbmb/MiniCPM5-2B-DSpark-GGUF

## Resumen

MiniCPM5-2B-DSpark-GGUF es la version en formato GGUF del modelo borrador (draft) MiniCPM5-2B-DSpark, publicado por OpenBMB para su uso como modelo auxiliar en decodificacion especulativa junto a MiniCPM5-2B dentro de llama.cpp. No es un modelo conversacional autonomo: su funcion es proponer secuencias de tokens que el modelo objetivo MiniCPM5-2B verifica en cada paso, de forma que la generacion final sea equivalente a la del modelo grande pero con menos pasos de decodificacion efectivos. El repositorio contiene un unico fichero, `MiniCPM5-2.6B-DSpark.gguf`, en precision BF16 y con un tamano de 653 MB.

El dato de parametros registrado en los metadatos del repositorio es de 323.776.001 parametros (aproximadamente 0,32 mil millones), coherente con la naturaleza de modelo borrador, aunque existe una discrepancia de nomenclatura apreciable: el identificador del repositorio dice "2B" y el nombre del fichero GGUF dice "2.6B". No se dispone de informacion que resuelva esta inconsistencia.

Se distribuye bajo licencia Apache-2.0, soporta los idiomas ingles y chino, y esta etiquetado por el autor con capacidades de contexto largo, tool calling y despliegue en dispositivo (edge). Es relevante ahora porque abarata la inferencia local de un modelo de la familia MiniCPM5 en hardware sin GPU dedicada, un escenario cada vez mas demandado para asistentes embebidos y aplicaciones de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el autor etiqueta el modelo con "llama" y "minicpm5", lo que apunta a un transformer de tipo LLaMA. Numero de capas, cabezas y tipo de atencion no disponibles |
| Parametros totales | 323.776.001 (dato de metadatos safetensors); el nombre del fichero GGUF indica 2,6B y el del repositorio 2B, discrepancia no resuelta |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo oficial de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | GGUF en BF16 (unico fichero publicado); no se listan otras cuantizaciones |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `MiniCPM5-2.6B-DSpark.gguf`, 653 MB, precision BF16) |

## Arquitectura y entrenamiento

No se proporciona informacion detallada sobre la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion, uso de RoPE o de atencion lineal) ni sobre la estrategia de destilacion o entrenamiento del borrador. Lo que si se documenta es su rol funcional: es un modelo DSpark, es decir, un borrador especifico para decodificacion especulativa, que en llama.cpp se activa con el parametro `--spec-type draft-dspark` y un maximo de 7 tokens propuestos por paso (`--spec-draft-n-max 7`).

En cuanto a datos, las etiquetas del repositorio apuntan al ecosistema UltraData de OpenBMB: `Ultra-FineWeb`, `UltraX-Preview` y `Ultra-FineWeb-L3` para preentrenamiento, `UltraData-Math` y `UltraData-Code` para dominios especializados, `UltraData-SFT-2605` y `UltraData-SFT-Agent-2609` para ajuste supervisado (incluyendo datos de agentes) y `UltraData-RL-2609` para refuerzo. No se especifica el numero de tokens, la composicion exacta del dataset ni si esas etapas se aplicaron al borrador o al modelo objetivo de la familia. La innovacion tecnica destacable es precisamente el metodo DSpark de decodificacion especulativa integrado en llama.cpp, que permite usar el borrador con GPU y offload completo (`-ngl 99 -ngld 99`) y atencion flash (`-fa on`).

## Capacidades

- Aceleracion de inferencia: actua como modelo borrador en decodificacion especulativa para MiniCPM5-2B, reduciendo el numero de evaluaciones del modelo objetivo.
- Generacion de texto acelerada indirectamente: gracias a la verificacion del modelo objetivo, la distribucion de salida se mantiene la del modelo grande, no la del borrador.
- Contexto largo: la etiqueta `long-context` aparece en el repositorio, aunque la longitud maxima soportada no se documenta; el ejemplo oficial arranca con 8192 tokens.
- Tool calling y agentes: las etiquetas `tool-calling` y los datasets de agentes (`UltraData-SFT-Agent-2609`) se asocian a la familia, pero la capacidad efectiva corresponde al modelo objetivo MiniCPM5-2B, no al borrador.
- Multilingue: ingles y chino, segun el campo `language` de la model card.
- Despliegue on-device: disenado para ejecutarse en llama.cpp con offload a GPU o en CPU, en entornos de recursos limitados.
- Modo de pensamiento, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Aceleracion de un asistente local sobre MiniCPM5-2B: se lanza `llama-server` con el modelo objetivo en cuantizacion Q4_K_M y este borrador como `-md`, obteniendo menor latencia por token sin cambiar la calidad de las respuestas verificadas.
- Despliegue en equipos sin GPU dedicada: con 653 MB en BF16 y un objetivo de aproximadamente 2B parametros cuantizado, el conjunto cabe en la RAM de un mini-PC o de una Raspberry Pi 5, permitiendo un chatbot offline con contexto de 8192 tokens.
- Servicio de generacion de texto en CPU dentro de una VM pequena: `llama-server` con `--jinja` y puerto 8080 expone una API compatible con OpenAI, util para integrar el modelo en backends ligeros sin coste de GPU.
- Asistentes de codigo en el IDE: el modelo objetivo puede completar y explicar fragmentos de codigo, y el borrador reduce la latencia percibida en completados repetitivos dentro de un editor local.
- Preprocesado y resumen de documentos largos en chino e ingles: con la ventana configurada a 8192 tokens se pueden resumir informes o extraer campos de contratos en un pipeline batch nocturno sin infraestructura GPU.
- Agentes con llamada a herramientas en local: a traves del modelo objetivo, con soporte de plantilla de chat (`--jinja`) para orquestar funciones y pasos multiples en entornos de automatizacion de escritorio.
- Prototipado e investigacion en decodificacion especulativa: sirve como referencia para medir tasas de aceptacion de borradores DSpark frente a otros metodos en llama.cpp antes de invertir en cabezas EAGLE o Medusa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | MiniCPM5-2B-DSpark-GGUF | Notas |
|---|---|---|
| MMLU | No disponible | No se reportan resultados de calidad para el borrador, ya que su salida es verificada por el modelo objetivo |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |
| Tasa de aceptacion de tokens (acceptance rate) | No disponible | Metrica clave de un borrador, no publicada en la model card |
| Aceleracion frente a decodificacion estandar | No disponible | No se indica factor de speedup ni hardware de referencia |

## Requisitos de hardware

- VRAM/RAM del borrador: aproximadamente 0,7-1,2 GB con el fichero BF16 de 653 MB y los buffers de inferencia (estimacion, no confirmada por el autor).
- VRAM/RAM del modelo objetivo: no disponible; como referencia orientativa, un transformer denso de 2B parametros en Q4_K_M ocupa del orden de 1,2-1,5 GB, pero el autor no publica cifras.
- GPU recomendadas: no se especifican. El ejemplo oficial usa `-ngl 99 -ngld 99`, es decir, offload completo de ambas redes a GPU si esta disponible.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y en GPUs integradas Apple Silicon via Metal; la cifra exacta no esta confirmada.
- Caber en CPU: si; el diseno on-device de la familia MiniCPM apunta a ejecucion en CPU sin GPU.
- Opciones de despliegue: llama.cpp / `llama-server` con `--spec-type draft-dspark`. No se documenta soporte en vLLM, TGI, Ollama ni Transformers para este borrador concreto; el repositorio solo incluye pesos GGUF.
- Configuracion de referencia: `llama-server -m MiniCPM5-2B-Q4_K_M.gguf -md MiniCPM5-2.6B-DSpark.gguf --spec-type draft-dspark --spec-draft-n-max 7 -ngl 99 -ngld 99 -fa on -c 8192 --jinja --port 8080`.
- Latencia y throughput: no disponibles. El unico parametro conocido es el maximo de 7 tokens borrador por paso.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La comparacion siguiente es cualitativa y marca como "no disponible" todo dato no publicado.

| Modelo | Rol | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| MiniCPM5-2B-DSpark-GGUF (este repositorio) | Borrador para decodificacion especulativa | 323.776.001 en metadatos (nomenclatura del repo: 2B; fichero: 2,6B) | No disponible (ejemplo con 8192) | Apache-2.0 | No disponible |
| MiniCPM5-2B (modelo objetivo, `openbmb/MiniCPM5-2B-GGUF`) | Modelo generativo principal | No disponible | No disponible | Apache-2.0 | No disponible |
| MiniCPM5-2B-DSpark (pesos originales en safetensors) | Borrador en formato Transformers | No disponible | No disponible | Apache-2.0 | No disponible |
| Otras aproximaciones de decodificacion especulativa (cabezas EAGLE-3, Medusa, borradores genericos de 0,5-1B) | Alternativas al borrador DSpark | Variable | Variable | Variable | No disponible en esta busqueda |

## Limitaciones y advertencias

- Modelo no autonomo: sus salidas no deben usarse directamente; solo tienen sentido como propuestas verificadas por MiniCPM5-2B. Ejecutarlo en solitario no es su caso de uso previsto.
- Discrepancia de nomenclatura: el repositorio dice 2B, el fichero GGUF dice 2,6B y los metadatos indican 323.776.001 parametros. Conviene verificar el recuento real antes de dimensionar hardware.
- Cobertura idiomatica limitada a ingles y chino; no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto no documentada: el unico dato es el valor `-c 8192` del ejemplo oficial. No hay confirmacion de que se pueda ampliar por encima de ese valor.
- Sin benchmarks publicados: no hay evidencia publica de tasa de aceptacion, factor de speedup ni degradacion en dominios concretos, por lo que el beneficio real de la aceleracion debe medirse en el hardware objetivo.
- Dependencia de una funcionalidad concreta de llama.cpp: el flag `--spec-type draft-dspark` requiere una version del runtime que lo soporte; otras herramientas de inferencia no estan documentadas como compatibles.
- Adopcion muy baja: 430 descargas y 9 likes en el momento de la consulta, con fecha de publicacion del 9 de septiembre de 2026. La validacion por parte de la comunidad es practicamente inexistente.
- Sesgos y alucinacion: el autor advierte de que las salidas se generan a partir de patrones estadisticos y pueden ser inexactas, sesgadas u ofensivas, y ser manipulables mediante jailbreaks. Las respuestas sobre politica, salud, finanzas o derecho no estan revisadas por expertos y no constituyen asesoramiento profesional.
- Uso comercial: permitido por Apache-2.0, sin restricciones adicionales declaradas, pero el usuario debe configurar sus propias salvaguardas y etiquetar el contenido generado por IA cuando la normativa lo exija.
- Garantia: el modelo se entrega "tal cual", sin garantia de ningun tipo, y los desarrolladores declinan responsabilidad por danos derivados de su uso.
- Referencia bibliografica desalineada: la cita incluida corresponde al informe tecnico de MiniCPM4 (arXiv:2506.07900), no a un documento especifico de MiniCPM5 ni del borrador DSpark.
- Busqueda web sin resultados utiles: las consultas realizadas devolvieron unicamente paginas de TikTok sin relacion con el modelo, por lo que no se ha podido contrastar informacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark-GGUF
- Modelo borrador en safetensors: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Modelo objetivo en GGUF: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Informe tecnico citado (MiniCPM): https://arxiv.org/pdf/2506.07900
- Repositorio GitHub de la familia MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Portal de datos UltraData: https://ultradata.openbmb.cn/
- Licencia Apache-2.0 del proyecto: https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE
- Busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos fueron paginas de TikTok sin relacion con el modelo.
