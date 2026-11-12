# maternion/Mage-VL-Cowork-4B-GGUF

## Resumen

Mage-VL-Cowork-4B-GGUF es la conversión a formato GGUF del modelo multimodal microsoft/Mage-VL-Cowork, un agente vision-language de 4B parámetros especializado en computer use. Lo desarrolla el equipo Mage de Microsoft y la cuantización la firma el usuario maternion. El modelo resuelve un problema concreto: operar interfaces gráficas y ejecutar comandos en una shell o intérprete de Python a partir de capturas de pantalla, todo dentro de una única política multimodal. Su relevancia radica en que alcanza el 66,0 % en OSWorld-Verified con solo 4B parámetros, el mejor resultado entre modelos de ese tamaño en el momento de su publicación, y en que esta versión GGUF permite ejecutarlo en hardware de consumo mediante llama.cpp.

La arquitectura combina una torre de texto Qwen3-4B (4.411.424.256 parámetros reales según safetensors) con una torre de visión Mage-ViT empaquetada por separado en un fichero mmproj. El contexto de entrenamiento es de 32K tokens, aunque la arquitectura soporta hasta 262K. Expone dos canales de acción: `computer_use`, con 11 primitivas de interfaz gráfica y coordenadas en el rango [0,999], y `bash`, para comandos de shell y Python.

El repositorio ofrece 12 cuantizaciones del texto (de BF16 a IQ1_M) más el mmproj obligatorio en BF16 de 0,66 GB. La licencia Apache-2.0 se hereda sin cambios del modelo original, lo que facilita su uso comercial. Es una opción relevante para quien necesite automatización de escritorio con agentes en local sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `llava_onevision2` personalizada en transformers (`trust_remote_code=True`); torre de texto Qwen3-4B, torre de vision Mage-ViT |
| Parametros totales | 4.411.424.256 (torre de texto; la vision va en mmproj separado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K entrenado; la arquitectura soporta hasta 262K |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ4_NL, Q3_K_M, Q3_K_S, IQ3_M, IQ2_M, IQ1_M (experimental); mmproj siempre en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); mmproj BF16 separado |

## Arquitectura y entrenamiento

El modelo original es una arquitectura `llava_onevision2` personalizada que requiere `trust_remote_code=True` en transformers. La torre de texto es Qwen3-4B y la torre de visión es Mage-ViT; en la conversión GGUF la torre de texto se exporta como arquitectura `qwen3` estándar, de modo que cualquier build reciente de llama.cpp la carga sin modificaciones. La torre de visión se distribuye aparte como `mmproj-Mage-VL-Cowork-BF16.gguf` (0,66 GB) y es independiente de la cuantización del texto. El modelo fue entrenado con 32K tokens de contexto y la arquitectura admite hasta 262K.

El detalle de datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no está disponible en la información proporcionada; la model card remite al informe técnico y a la model card original para esos datos. La innovación destacable es el diseño híbrido de canales: un mismo modelo enruta entre control de GUI y ejecución de comandos en shell o Python, con historial de acciones plegado y una ventana de trabajo de tres capturas de pantalla. La cuantización de esta versión se generó con un pipeline de dos pasos: `convert_hf_to_gguf.py` para el BF16 y el mmproj, y `llama-quantize --imatrix` con una matriz de importancia recogida sobre 800 fragmentos de 512 tokens (unos 410.000 tokens) de prosa técnica mixta. Se cubren 252 de 252 tensores matmul esperados; `output.weight` y `token_embd.weight` usan los fallbacks estándar de llama.cpp (q6_K e IQ4_XS).

## Capacidades

- Control de interfaz gráfica basado en capturas de pantalla mediante el canal `computer_use`, con 11 primitivas de GUI y coordenadas normalizadas en [0,999].
- Ejecución de comandos de shell y Python mediante el canal `bash` dentro de la misma política.
- Enrutado híbrido entre acciones de GUI y comandos de terminal, con historial de acciones plegado y ventana de trabajo de tres capturas.
- Comprensión de imágenes y texto (pipeline image-text-to-text).
- Conversación multiturno con contexto de 32K tokens.
- Integración con tool calling a través del contrato de herramientas `computer_use`/`bash` embebido en la plantilla de chat estilo Qwen2.
- Compatibilidad con endpoints de llama.cpp (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede interpretar capturas de pantalla y emitir clics, escritura y atajos de teclado sobre aplicaciones reales, adecuado para flujos repetitivos de back office gracias a su canal `computer_use` con coordenadas normalizadas.
- Agente híbrido GUI más terminal: para tareas que requieren alternar entre manipular una interfaz y ejecutar scripts, el enrutado interno entre `computer_use` y `bash` evita encadenar dos modelos distintos.
- Pruebas de regresión de interfaces: el modelo puede recorrer flujos de una aplicación y verificar estados visuales, útil en pipelines de QA que necesitan un agente que "vea" la pantalla.
- Asistencia en administración de sistemas: con el canal `bash` puede proponer y ejecutar comandos de diagnóstico o mantenimiento en un entorno sandbox, leyendo la salida y decidiendo el siguiente paso.
- Extracción de datos de aplicaciones legacy: cuando no hay API, el modelo puede navegar la interfaz, leer los valores en pantalla y volcarlos a un formato estructurado.
- Despliegue local en estaciones de trabajo: con Q4_K_M (2,72 GB) más el mmproj (0,66 GB) cabe en cualquier GPU de 8 GB o más, lo que permite ejecutar el agente en el propio equipo del usuario sin enviar capturas de pantalla a un servicio externo.
- Investigación en agentes computer-use: sirve como política de referencia de 4B parámetros para experimentos de evaluación en OSWorld u otros entornos, con la ventaja de poder correr en hardware asequible.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo original en BF16, no a las cuantizaciones de este repositorio.

| Benchmark | Mage-VL-Cowork (BF16) |
|---|---|
| OSWorld-Verified | 66,0 % |
| Tareas de sistema operativo (OS tasks) | 87,5 % |
| Flujos multi-aplicación | 62,7 % |

No se han publicado resultados de benchmarks de las versiones GGUF en la información disponible. La model card advierte que las cuantizaciones Q2 y menores degradan la precisión de localización de coordenadas, algo crítico en un modelo de computer use, y recomienda evaluar los cuantizados i-bit por clics correctos por tarea en el harness propio en lugar de por impresiones subjetivas.

## Requisitos de hardware

- VRAM estimada para el texto: 8,83 GB en BF16, 4,69 GB en Q8_0, 3,63 GB en Q6_K, 3,16 GB en Q5_K_M, 2,72 GB en Q4_K_M, 2,48 GB en IQ4_XS, 2,24 GB en Q3_K_M, 1,68 GB en IQ2_M y 1,25 GB en IQ1_M.
- Sumar siempre 0,66 GB del mmproj en BF16, independientemente de la cuantización del texto.
- GPU recomendadas: cualquier GPU con 8 GB o más para Q4_K_M con mmproj; A100 o H100 para BF16 y Q8_0 con contexto largo; RTX 4090 para Q6_K o Q8_0 con margen.
- Cabe en GPU de consumo: Q4_K_M con mmproj ocupa unos 3,4 GB, por lo que entra en tarjetas de 8 GB; IQ3_M e IQ2_M permiten bajar a 6 GB o menos.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con soporte de API compatible con OpenAI y carga automática del mmproj al usar `-hf`; también `llama-cli` y bindings de llama.cpp. vLLM, TGI y Ollama no están confirmados en la información disponible.
- Requiere un build de llama.cpp reciente: los ficheros se generaron con `0.9.0-dev` (commit `7c2653acc`, build b12277); builds anteriores deben recompilarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OSWorld-Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Mage-VL-Cowork-4B (esta ficha) | 4,4B texto + vision | 32K entrenado, hasta 262K | 66,0 % | Apache-2.0 | GGUF, safetensors |
| Modelos computer-use de 4B alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos computer-use de mayor tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables de la misma categoría, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo ejecuta comandos de shell y acciones de GUI por diseño; requiere aislamiento en sandbox, autorización acotada y exposición cero de credenciales, tal como advierte la model card original.
- Las cuantizaciones Q2 e inferiores degradan la precisión de las coordenadas, lo que provoca clics erróneos; IQ1_M se describe como notablemente degradado y experimental.
- Los benchmarks publicados corresponden al BF16 original; el rendimiento de las versiones cuantizadas puede ser inferior y debe validarse en el harness propio.
- Riesgo de alucinación en la interpretación de capturas de pantalla y en la generación de comandos: un comando mal inferido puede tener efectos destructivos si no se ejecuta en un entorno controlado.
- Idiomas soportados no disponibles; no se puede confirmar el comportamiento en castellano.
- El comportamiento de agente completo (enrutado híbrido, historial plegado, ventana de tres capturas) requiere el harness MAGEHybridAgent; usarlo como chat completion simple no reproduce el rendimiento reportado.
- La licencia Apache-2.0 permite uso comercial, pero las consideraciones de uso responsable del modelo original siguen aplicando.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente sin validación comunitaria amplia.
- El tamaño del repo (40,1 GB) incluye todas las cuantizaciones; conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maternion/Mage-VL-Cowork-4B-GGUF
- Modelo original: https://huggingface.co/microsoft/Mage-VL-Cowork
- Página del proyecto: https://microsoft.github.io/Mage/cowork/
- Informe técnico: https://github.com/microsoft/Mage/blob/main/assets/mage_vl_cowork_tech_report.pdf
- Harness del agente: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
