# maternion/Mage-VL-Cowork-GGUF

## Resumen

Mage-VL-Cowork es un modelo de lenguaje y visión de 4.400 millones de parámetros desarrollado por el equipo Mage de Microsoft, diseñado específicamente como agente de uso de ordenador (*computer-use*). Combina un canal de control de interfaz gráfica (`computer_use`, con 11 primitivas GUI y coordenadas en el rango `[0,999]`) con un canal persistente de shell y Python (`bash`) dentro de una única política visión-lenguaje. Su torre de texto es Qwen3-4B y su torre de visión es Mage-ViT, integradas mediante una arquitectura personalizada `llava_onevision2` que requiere `trust_remote_code=True` en transformers.

El modelo destaca por su rendimiento en tareas de automatización de escritorio: alcanza un 66,0 % en OSWorld-Verified con solo 4B de parámetros, con un 87,5 % en tareas de sistema operativo y un 62,7 % en flujos multi-aplicación, según los datos publicados por el autor de la conversión. Está entrenado con una ventana de 32K tokens, aunque la arquitectura soporta hasta 262K.

Esta ficha describe la conversión a GGUF realizada por el usuario `maternion`, que permite ejecutar el modelo en llama.cpp con soporte de visión mediante un archivo mmproj separado en BF16. La licencia Apache-2.0 se mantiene sin cambios respecto al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `llava_onevision2` personalizada (torre de texto Qwen3-4B + torre de visión Mage-ViT) |
| Parámetros totales | 4.411.424.256 (torre de texto; visión en mmproj separado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K en entrenamiento; arquitectura soporta hasta 262K |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ4_NL, Q3_K_M, Q3_K_S, IQ3_M, IQ2_M, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); mmproj de visión en BF16 |

## Arquitectura y entrenamiento

La arquitectura combina una torre de texto Qwen3-4B con una torre de visión Mage-ViT, unidas mediante un diseño `llava_onevision2` que en transformers exige `trust_remote_code=True`. El modelo integra dos canales de acción en una sola política: `computer_use`, que emite 11 primitivas de control GUI con coordenadas normalizadas en `[0,999]`, y `bash`, que permite ejecutar comandos de shell y Python de forma persistente. La plantilla de chat es de estilo Qwen2 e incluye el contrato de herramientas `computer_use`/`bash` embebido en el GGUF.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada; la model card remite al informe técnico y a la model card original de Microsoft para esos datos. La conversión a GGUF se realizó en dos pasos: primero `convert_hf_to_gguf.py` para generar el BF16 de la torre de texto (8,83 GB) y el mmproj BF16 separado, y después `llama-quantize` con una importance matrix recogida sobre 800 fragmentos de 512 tokens (~410k tokens) de prosa técnica mixta. Se cubren 252/252 tensores matmul esperados, con los fallbacks estándar de llama.cpp para `output.weight` (q6_K) y `token_embd.weight` (IQ4_XS).

## Capacidades

- Control de interfaz gráfica mediante el canal `computer_use` con 11 primitivas GUI y coordenadas en `[0,999]`.
- Ejecución persistente de comandos de shell y Python mediante el canal `bash`.
- Enrutamiento híbrido entre acciones GUI y bash dentro de una misma política.
- Comprensión de imágenes (pipeline `image-text-to-text`) con torre de visión Mage-ViT.
- Razonamiento multi-paso orientado a agentes de escritorio.
- Ventana de trabajo de 3 capturas de pantalla con historial de acciones plegado (según el harness MAGEHybridAgent).
- Soporte de tool calling mediante el contrato `computer_use`/`bash` embebido en la plantilla de chat.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede controlar ratón y teclado mediante las 11 primitivas GUI para completar flujos como rellenar formularios, gestionar archivos o configurar aplicaciones, con un 87,5 % de éxito en tareas de sistema operativo según los datos del autor.
- Agente híbrido GUI + shell: combinando los canales `computer_use` y `bash`, puede resolver tareas que requieren tanto interacción visual como ejecución de scripts, con un 62,7 % en flujos multi-aplicación.
- Pruebas de regresión de interfaces: integrado en pipelines de CI/CD para validar que una aplicación de escritorio sigue funcionando tras cambios, ejecutando secuencias de acciones GUI y verificando resultados visualmente.
- Asistencia remota automatizada: desplegado en un entorno sandboxizado, puede ejecutar tareas de soporte técnico guiadas por lenguaje natural (abrir paneles de configuración, revisar logs vía bash, etc.).
- Extracción de datos de aplicaciones legacy: el modelo puede navegar por interfaces sin API y extraer información combinando capturas de pantalla con comandos de shell para volcar resultados.
- Formación y evaluación de agentes: sirve como política base de 4B parámetros para experimentar con harness de agentes (MAGEHybridAgent) en entornos controlados, con un coste de VRAM reducido (2,72 GB en Q4_K_M más 0,66 GB de mmproj).
- Automatización de tareas ofimáticas: gestión de hojas de cálculo, documentos y correo mediante interacción GUI, adecuada para flujos repetitivos que no disponen de API.

## Benchmarks y rendimiento

| Benchmark | Mage-VL-Cowork (4B) |
|---|---|
| OSWorld-Verified | 66,0 % |
| Tareas de sistema operativo (OS tasks) | 87,5 % |
| Flujos multi-aplicación | 62,7 % |

Los datos corresponden al modelo original en BF16 según la model card del autor de la conversión; la calidad tras cuantización depende de los ajustes empleados. No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia (torre de texto + mmproj BF16 de 0,66 GB):
  - BF16: ~8,83 GB + 0,66 GB ≈ 9,5 GB.
  - Q8_0: ~4,69 GB + 0,66 GB ≈ 5,4 GB.
  - Q6_K: ~3,63 GB + 0,66 GB ≈ 4,3 GB.
  - Q4_K_M: ~2,72 GB + 0,66 GB ≈ 3,4 GB.
  - IQ3_M: ~2,13 GB + 0,66 GB ≈ 2,8 GB.
  - IQ2_M: ~1,68 GB + 0,66 GB ≈ 2,3 GB.
  - IQ1_M: ~1,25 GB + 0,66 GB ≈ 1,9 GB (experimental, degradado).
- GPU recomendadas: cualquier GPU con 8 GB o más para Q4_K_M; A100/H100 no son necesarias por el tamaño del modelo, pero aportan margen para contextos largos y concurrencia.
- Cabe en GPU de consumo: sí, desde 8 GB (Q4_K_M) hasta 4 GB (Q6_K) o menos con cuantizaciones IQ.
- Opciones de despliegue: `llama-server` de llama.cpp (API compatible con OpenAI y soporte de visión), con builds recientes (probado con `0.9.0-dev`, commit `7c2653acc`, b12277). El harness MAGEHybridAgent es necesario para el comportamiento de agente completo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos alternativos en la información proporcionada. Como referencia estructural, el modelo se sitúa en la categoría de agentes de uso de ordenador de ~4B parámetros con soporte de visión, pero no se han publicado comparaciones directas con otras alternativas en la documentación disponible.

| Modelo | Parámetros | Contexto | OSWorld-Verified | Licencia |
|---|---|---|---|---|
| Mage-VL-Cowork | 4,4B | 32K (hasta 262K) | 66,0 % | Apache-2.0 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las cuantizaciones de clase Q2 e inferiores degradan notablemente la precisión de *grounding* GUI: pequeños errores de coordenadas afectan mucho a un modelo de computer-use, por lo que deben evaluarse con clics-por-tarea reales en el harness.
- IQ1_M está marcada como experimental y "notablemente degradada" por el autor.
- El modelo ejecuta comandos de shell y acciones GUI por diseño; requiere aislamiento en sandbox, autorización acotada y exposición cero de credenciales, tal como advierte la model card original.
- Riesgo de alucinación y sesgos: no se han documentado sesgos específicos en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- La calidad de las cuantizaciones depende de los ajustes; los benchmarks publicados corresponden al modelo BF16 original.
- El uso del comportamiento de agente completo requiere el harness MAGEHybridAgent, no basta con chat completion simple.
- Licencia Apache-2.0 permite uso comercial, pero las consideraciones de uso responsable del modelo original siguen aplicando.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maternion/Mage-VL-Cowork-GGUF
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Página del proyecto: https://microsoft.github.io/Mage/cowork/
- Informe técnico: https://github.com/microsoft/Mage/blob/main/assets/mage_vl_cowork_tech_report.pdf
- Harness MAGEHybridAgent: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
