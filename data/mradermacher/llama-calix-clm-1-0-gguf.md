# mradermacher/Llama-Calix-CLM-1.0-GGUF

## Resumen

Llama-Calix-CLM-1.0 es un modelo de lenguaje de 8.030 millones de parámetros desarrollado por Calix AI Labs, especializado en el dominio de redes de telecomunicaciones. Se trata de un modelo derivado de la familia Llama 3.1 (bajo licencia Llama 3.1 Community License), entrenado mediante continued pretraining y supervised fine-tuning sobre un corpus técnico que cubre protocolos y tecnologías como BGP, OSPF, IS-IS, MPLS, QoS, multicast, BNG, PON, WiFi y redes Linux. El repositorio aquí descrito es la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estáticas de modelos populares para su uso con llama.cpp y derivados.

Su relevancia radica en la escasez de modelos abiertos con conocimiento profundo del sector telecom y networking: la mayoría de LLM genéricos rinden de forma limitada en tareas como diagnóstico de configuraciones de routing, planificación de redes de acceso o soporte técnico de nivel 2/3. Un modelo con continued pretraining sobre documentación de dominio puede ofrecer respuestas más precisas a ingenieros de red, operadores de ISP y equipos de soporte. La versión GGUF permite ejecutarlo localmente desde una GPU de consumo, lo que facilita su adopción en entornos con requisitos de privacidad, habituales en operadoras.

La variante cuantizada ofrece un rango completo de cuantizaciones, desde Q2_K (3,3 GB) hasta f16 (16,2 GB), con Q4_K_S y Q4_K_M marcadas como recomendadas por el cuantizador por su equilibrio entre calidad y velocidad. El modelo es conversacional y está orientado a generación de texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.312 (≈8,03 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (esta repo); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base, calix-ai-labs/Llama-Calix-CLM-1.0, es un modelo de 8.030 millones de parámetros basado en la arquitectura Llama 3.1 (transformer decoder-only). Según los metadatos del repositorio, el entrenamiento combinó continued pretraining (CLM) sobre corpus técnico de telecomunicaciones y redes, supervised fine-tuning (SFT), knowledge distillation y LoRA como técnica de ajuste eficiente de parámetros. La etiqueta "rsod" aparece entre los tags del modelo, aunque su significado concreto no está documentado en la model card disponible.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre el uso de RLHF o DPO. Tampoco se detalla la longitud de contexto resultante, aunque al derivar de Llama 3.1 es plausible que herede la ventana de 128K tokens del modelo original; este dato no está confirmado en la información disponible, por lo que debe verificarse antes de depender de contextos largos.

La versión aquí reseñada es una cuantización estática en GGUF realizada por mradermacher a partir del modelo original en safetensors. Se ofrecen doce variantes de cuantización por peso (de Q2_K a f16), sin cuantizaciones imatrix/weighted en el momento de redacción de la ficha. Las variantes Q4_K_S (4,8 GB) y Q4_K_M (5,0 GB) están marcadas como "rápidas y recomendadas", y Q8_0 (8,6 GB) como la de mejor calidad entre las comprimidas.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), orientada a asistencia técnica en redes.
- Conocimiento especializado en protocolos de routing y switching: BGP, OSPF, IS-IS.
- Conocimiento de tecnologías de transporte y servicios: MPLS, QoS, multicast.
- Dominio de redes de acceso y banda ancha: BNG (Broadband Network Gateway), PON, WiFi.
- Redes sobre Linux (linux-networking), útil para configuración de stack de red en servidores.
- Etiquetas de continued pretraining, SFT, knowledge distillation y LoRA sugieren capacidad de respuesta técnica detallada en dominio, aunque no se documentan capacidades de tool calling, agentes, vision, audio ni thinking mode: no disponible.

## Casos de uso

- Soporte técnico de nivel 2/3 en operadoras: el modelo puede asistir en el diagnóstico de incidencias de BGP, OSPF o MPLS, proponiendo causas probables y comandos de verificación, gracias a su continued pretraining sobre documentación de dominio.
- Generación y revisión de configuraciones de red: redacción de configuraciones para routers y switches (OSPF, IS-IS, BGP) con validación conceptual previa a su despliegue en laboratorio.
- Documentación técnica de ISP: redacción de procedimientos operativos, runbooks y documentación interna sobre BNG, PON y QoS, reduciendo el tiempo de creación de material especializado.
- Formación de personal de NOC: generación de explicaciones y ejercicios sobre protocolos de networking para onboarding de técnicos junior.
- Asistente offline para ingenieros de redes desplegados en campo: la cuantización Q4_K_M (5 GB) permite ejecutar el modelo en un portátil con GPU de consumo sin conexión a servicios en la nube, relevante por la sensibilidad de la información de red de operadoras.
- Automatización de respuestas en portales de soporte de CPE y WiFi doméstico: integración como backend conversacional para resolver dudas de configuración de equipos de acceso.
- Análisis de logs y configuraciones Linux de red: asistencia interpretando salidas de ip, tc, iperf u otras herramientas del stack de red de Linux.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base no incluye evaluaciones en MMLU, HumanEval, GSM8K ni benchmarks de dominio de networking.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos solamente, según la tabla de cuantizaciones):
  - Q2_K: ~3,3 GB
  - Q4_K_S / Q4_K_M: ~4,8–5,0 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
  - Añadir margen para KV cache según la longitud de contexto utilizada (dato de contexto no disponible).
- GPU recomendadas: cualquier GPU de consumo con 8 GB de VRAM (RTX 3060, RTX 4060 Ti) ejecuta cómodamente Q4_K_M; con 12–16 GB (RTX 4070 Ti Super, RTX 4080) cabe Q8_0; para f16 se recomienda 24 GB (RTX 3090/4090) o una A100.
- Cabe en consumer GPU: sí, desde 6–8 GB de VRAM con cuantizaciones Q3/Q4. También es ejecutable en CPU pura con llama.cpp a velocidad reducida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. No es un GGUF dirigido a vLLM o TGI (que consumen safetensors; para ello usar el modelo base).
- Latencia y throughput: no disponible. Dado el tamaño (~8 B) y la cuantización Q4, se espera inferencia fluida en GPU de consumo, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| Llama-Calix-CLM-1.0 | 8,03 B | Telecom y networking (continued pretraining) | Llama 3.1 Community | safetensors / GGUF |
| Llama 3.1 8B Instruct (base del derivado) | 8 B | Generalista | Llama 3.1 Community | safetensors / GGUF |
| Qwen2.5-7B-Instruct | 7,6 B | Generalista, fuerte en codigo | Apache 2.0 / Qwen | safetensors / GGUF |
| Mistral-7B-Instruct v0.3 | 7,2 B | Generalista | Apache 2.0 | safetensors / GGUF |

Frente a su modelo base (Llama 3.1 8B), Calix-CLM aporta conocimiento de dominio en networking a costa de posible regresión en capacidades generales, un efecto habitual del continued pretraining. Frente a alternativas generalistas como Qwen2.5-7B o Mistral-7B, su ventaja es la especialización sectorial; su desventaja es la licencia Llama 3.1 (con restricciones de marca y límites de uso) frente a las licencias Apache 2.0 de las alternativas, y la ausencia de benchmarks publicados que permitan verificar la mejora en dominio.

## Limitaciones y advertencias

- Licencia Llama 3.1 Community: permite uso comercial, pero impone condiciones como la atribución ("Llama" en el nombre del producto derivado, según corresponda) y restricciones para ciertos casos de uso definidos en la política de uso aceptable de Meta. Revisar la licencia antes de producto comercial.
- Idioma: el modelo está etiquetado solo para inglés; su rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no confirmada: no asumir 128K tokens sin verificar la configuración del modelo base.
- Riesgo de alucinación: como todo LLM, puede generar configuraciones de red incorrectas con apariencia plausible. En networking, una configuración errónea puede causar caídas de servicio; validar siempre en laboratorio antes de aplicar cambios en producción.
- Cuantizaciones agresivas (Q2_K, Q3_K_M) degradan la calidad, especialmente en terminología técnica precisa (nombres de comandos, parámetros de protocolo); preferir Q4_K_M o superior.
- Sin benchmarks publicados: la calidad de la especialización en dominio no puede verificarse con datos objetivos a partir de la información disponible.
- Sin cuantizaciones imatrix/weighted disponibles en el momento de esta ficha; pueden solicitarse al autor vía Community Discussion.
- Sesgos: no documentados; al derivar de Llama 3.1, hereda potencialmente los sesgos del modelo base y del corpus técnico de entrenamiento.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Llama-Calix-CLM-1.0-GGUF
- Modelo base (Calix AI Labs): https://huggingface.co/calix-ai-labs/Llama-Calix-CLM-1.0
- Página de descargas del cuantizador: https://hf.tst.eu/model#Llama-Calix-CLM-1.0-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo oficial del modelo base: no disponible
