# maternion/Mage-VL-Cowork-GGUF

## Resumen

Mage-VL-Cowork es un modelo vision-language de 4.400 millones de parámetros desarrollado por el equipo Mage de Microsoft, especializado en computer use: control de interfaces gráficas a partir de capturas de pantalla y ejecución de comandos en un canal de shell/Python persistente dentro de una única política multimodal. Combina una torre de texto Qwen3-4B con una torre de visión propietaria (Mage-ViT) bajo una arquitectura personalizada `llava_onevision2`. El repositorio aquí descrito, `maternion/Mage-VL-Cowork-GGUF`, es una conversión a formato GGUF del modelo original en BF16, con cuantizaciones de 1 a 8 bits para su uso con llama.cpp.

La relevancia del modelo radica en su rendimiento en OSWorld-Verified: 66,0 % con solo 4B de parámetros, la mejor marca entre modelos de ese tamaño en el momento de su publicación, con un 87,5 % en tareas de sistema operativo y un 62,7 % en flujos multi-aplicación. Esto lo sitúa como una opción viable para agentes de automatización de escritorio que deben ejecutarse en hardware modesto.

La conversión GGUF, realizada por el usuario maternion, mantiene la licencia Apache-2.0 del original y añade una matriz de importancia (imatrix) para las cuantizaciones IQ. El modelo está entrenado con una ventana de contexto de 32K tokens, aunque la arquitectura soporta hasta 262K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `llava_onevision2` personalizada (torre de texto Qwen3-4B + torre de visión Mage-ViT) |
| Parametros totales | 4.411.424.256 (4,4B, torre de texto; visión en mmproj separado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K entrenado; arquitectura soporta hasta 262K |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ4_NL, Q3_K_M, Q3_K_S, IQ3_M, IQ2_M, IQ1_M; mmproj en BF16 o Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp v0.9.0+) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal de tipo LLaVA-OneVision adaptada, denominada `llava_onevision2` en transformers (requiere `trust_remote_code=True`). La torre de texto es Qwen3-4B y la torre de visión es Mage-ViT, empaquetada en un archivo mmproj independiente. La política resultante integra dos canales de acción: `computer_use`, con 11 primitivas de interfaz gráfica y coordenadas en el rango `[0,999]`, y `bash`, para ejecución de comandos de shell y Python. El modelo fue entrenado con una ventana de 32K tokens.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La conversión GGUF se realizó en dos pasos: primero `convert_hf_to_gguf.py` para generar el BF16 y el mmproj, y después `llama-quantize` con una imatrix recogida sobre 800 fragmentos de 512 tokens (aproximadamente 410.000 tokens) de prosa técnica mixta. Las cuantizaciones IQ aprovechan la imatrix, mientras que las K-quants apenas la utilizan. El template de chat (estilo Qwen2 con contrato de herramientas `computer_use`/`bash`) está embebido en el GGUF.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes (capturas de pantalla) y texto para producir respuestas y acciones.
- Control de interfaz gráfica: 11 primitivas GUI con coordenadas normalizadas en `[0,999]`, incluyendo clics, escritura y desplazamiento.
- Ejecución de comandos: canal `bash` persistente para shell y Python dentro de la misma política.
- Enrutamiento híbrido GUI/bash: el modelo decide qué canal usar según la tarea.
- Soporte de tool calling mediante el contrato de herramientas embebido en el template de chat.
- Comportamiento de agente multi-paso: ventana de trabajo de 3 capturas de pantalla y historial de acciones plegado.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede operar aplicaciones nativas mediante clics y teclado sobre capturas de pantalla, adecuado para flujos repetitivos de oficina como rellenar formularios o gestionar correo.
- Agente de soporte técnico remoto: combinando GUI y bash, puede diagnosticar y resolver incidencias en un entorno de escritorio, ejecutando comandos y verificando el estado visual del sistema.
- Pruebas de regresión de interfaces: actúa como agente que navega una aplicación y valida visualmente el resultado, útil en pipelines de QA con hardware de gama media gracias a su tamaño de 4B.
- Automatización de flujos multi-aplicación: con un 62,7 % en OSWorld-Verified para flujos que cruzan varias aplicaciones, sirve para orquestar transferencia de datos entre programas (por ejemplo, exportar de una hoja de cálculo e importar en un CRM).
- Despliegue en estaciones de trabajo con GPU consumer: la cuantización Q4_K_M (2,72 GB) más el mmproj BF16 (0,66 GB) cabe en GPUs de 8 GB, lo que permite ejecutar el agente localmente sin depender de la nube.
- Investigación en agentes computer-use: el formato GGUF y la compatibilidad con llama-server facilitan experimentar con cuantizaciones y medir su impacto en la precisión de las coordenadas, un aspecto crítico para este tipo de modelos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| OSWorld-Verified | 66,0 % |
| OSWorld (tareas de sistema operativo) | 87,5 % |
| OSWorld (flujos multi-aplicación) | 62,7 % |

Estos datos corresponden al modelo original en BF16 según la model card; el rendimiento de las cuantizaciones depende de los ajustes. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras pruebas estándar de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 1,25 GB (IQ1_M, experimental y degradado) hasta 8,83 GB (BF16). El mmproj añade 0,66 GB en BF16 o 0,33 GB en Q8_0 independientemente de la cuantización del texto.
- Cuantización recomendada: Q4_K_M (2,72 GB) más mmproj BF16 (0,66 GB) cabe con holgura en cualquier GPU de 8 GB o más.
- GPU recomendadas: RTX 3060/4060 (8 GB) para Q4_K_M; RTX 4090 o A100/H100 para BF16 o Q8_0 con contextos largos.
- Cabe en GPU consumer: sí, desde 8 GB con Q4_K_M; IQ3_M/IQ2_M para VRAM ajustada.
- Opciones de despliegue: llama.cpp v0.9.0+ mediante `llama-server` (API compatible con OpenAI y soporte de visión); `llama-server -hf maternion/Mage-VL-Cowork-GGUF:Q4_K_M` descarga automáticamente el mmproj.
- Latencia y throughput: no disponible.
- Nota operativa: el harness MAGEHybridAgent es necesario para reproducir el comportamiento de agente completo (enrutamiento híbrido, historial plegado, ventana de 3 capturas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OSWorld-Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Mage-VL-Cowork (este) | 4,4B | 32K (hasta 262K) | 66,0 % | Apache-2.0 | GGUF, BF16 original |
| Alternativas de 4B para computer use | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de mayor tamaño para computer use | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos concretos de modelos comparables de la misma categoría (agentes computer-use de 4B) para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Las cuantizaciones de clase Q2 e inferiores degradan la precisión de las coordenadas GUI; los pequeños errores de posicionamiento afectan mucho a un modelo de computer use. IQ1_M es experimental y notablemente degradado.
- Los benchmarks publicados corresponden al modelo BF16; las cuantizaciones pueden reducir el rendimiento y deben evaluarse con clics-por-tarea reales en el harness propio.
- El modelo ejecuta comandos de shell y acciones GUI por diseño; requiere aislamiento en sandbox, autorización acotada y ausencia total de exposición de credenciales.
- Riesgo de alucinación y de acciones incorrectas en entornos reales: no se han publicado tasas de error específicas en la información disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento multilingüe.
- Licencia Apache-2.0: permite uso comercial, pero las consideraciones de uso responsable del modelo original siguen aplicándose.
- El modelo requiere llama.cpp v0.9.0 o superior y, para el comportamiento de agente completo, el harness MAGEHybridAgent en lugar de chat completion simple.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maternion/Mage-VL-Cowork-GGUF
- Modelo original: https://huggingface.co/microsoft/Mage-VL-Cowork
- Página del proyecto: https://microsoft.github.io/Mage/cowork/
- Informe técnico: https://github.com/microsoft/Mage/blob/main/assets/mage_vl_cowork_tech_report.pdf
- Harness del agente: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
