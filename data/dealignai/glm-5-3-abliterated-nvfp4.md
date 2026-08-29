# dealignai/GLM-5.3-ABLITERATED-NVFP4

## Resumen

GLM-5.3-ABLITERATED-NVFP4 es una variante del modelo GLM-5.3 de Z.ai, publicada por el usuario dealignai bajo su marca "CRACK". Se trata de un modelo de 753.000 millones de parámetros (aproximadamente 18.000 millones activos por token) con arquitectura MoE (Mixture of Experts) combinada con atención MLA (Multi-head Latent Attention) y atención dispersa estilo DeepSeek. La modificación principal consiste en la eliminación permanente de los comportamientos de rechazo a nivel de pesos, sin recurrir a fine-tuning, jailbreaks ni adaptadores, de modo que el modelo responde a solicitudes de seguridad ofensiva (explotación, payloads, herramientas de red team) que los modelos estándar suelen rechazar.

El modelo se distribuye cuantizado en NVFP4 (4 bits para los expertos enrutados, bf16 para atención y expertos compartidos) y soporta una ventana de contexto de 1 millón de tokens. Incluye un cabezal de predicción multi-token (MTP) y modos de razonamiento configurables (off, low, high, max). Está pensado para entornos de ciberseguridad autorizada, investigación de malware y CTFs, aunque conserva capacidades generales de razonamiento y generación de código. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este lanzamiento radica en que ofrece una alternativa "sin censura" a nivel de pesos para profesionales de seguridad que necesitan generar código funcional para pruebas de penetración, sin depender de técnicas de jailbreak frágiles o plantillas de prompt. El autor reporta una degradación mínima en MMLU (84,11% frente al 85,58% del modelo base) y ausencia de degeneración o bucles en las salidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 (`glm_moe_dsa`) — MoE + MLA + DeepSeek-sparse attention |
| Parametros totales | 753B |
| Parametros activos | ~18B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados en 4 bits; atención y expertos compartidos en bf16) |
| Idiomas soportados | Inglés (según la model card; el modelo base de Z.ai puede soportar más, pero esta variante declara solo `en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLM-5.3 de Z.ai, que combina un mecanismo MoE con atención MLA (Multi-head Latent Attention) y atención dispersa (sparse attention) inspirada en DeepSeek. Esta combinación permite manejar contextos de hasta 1 millón de tokens con un coste computacional reducido, activando solo ~18B de los 753B parámetros por token. Incluye además un cabezal de predicción multi-token (MTP) que actúa como borrador para acelerar la decodificación especulativa.

El proceso de "abliteración" (CRACK) consiste en una edición directa de los tensores del modelo para eliminar los pesos responsables de los comportamientos de rechazo. Según el autor, no se empleó fine-tuning, SFT, DPO, LoRA, vectores de dirección, hooks en tiempo de ejecución ni modificaciones en el código del modelo. El resultado es un cambio permanente en los pesos que se carga con vLLM estándar sin necesidad de parches adicionales. El autor afirma que la capacidad general se preserva, con una caída de 1,47 puntos porcentuales en MMLU (de 85,58% a 84,11%).

No se dispone de información detallada sobre los datos de entrenamiento del modelo base, ya que Z.ai no los ha publicado. El proceso de abliteración no implica entrenamiento adicional, por lo que los datos de entrenamiento son los del GLM-5.3 original.

## Capacidades

- Generación de código funcional para seguridad ofensiva: exploits, payloads, reverse shells, keyloggers, ransomware, escalada de privilegios, fuerza bruta SSH e inyecciones SQL, verificados por el autor en modo greedy.
- Razonamiento multi-paso con modos configurables (off, low, high, max effort) para tareas complejas de programación y agentes.
- Tool calling y function calling, con soporte para el parser `glm47` en vLLM y activación automática de herramientas.
- Predicción multi-token (MTP) que acelera la generación mediante decodificación especulativa.
- Manejo de contexto largo de hasta 1M tokens, adecuado para análisis de repositorios completos o documentos extensos.
- Capacidades multilingües limitadas: la model card declara solo inglés, aunque el modelo base de Z.ai podría soportar más idiomas; esta variante no lo especifica.
- Sin degeneración ni bucles en las salidas, según las pruebas del autor en todos los modos de razonamiento.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo genera exploits y payloads funcionales para evaluar la seguridad de sistemas propios o con permiso explícito, reduciendo el tiempo de desarrollo manual de herramientas.
- Análisis de malware: puede desglosar muestras de código malicioso, explicar su funcionamiento y sugerir contramedidas, gracias a su capacidad para manejar código ofensivo sin rechazos.
- Preparación de CTFs (Capture The Flag): genera soluciones para retos de explotación, criptografía y reversing, y puede razonar sobre los pasos necesarios para resolver cada desafío.
- Automatización de tareas de red team: integrable en pipelines de seguridad para generar scripts de reconocimiento, exfiltración de datos o persistencia, con soporte de tool calling para interactuar con sistemas externos.
- Investigación en seguridad defensiva: permite estudiar cómo funcionan los ataques reales (keyloggers, ransomware, etc.) para desarrollar firmas de detección y reglas de mitigación.
- Generación de código general y asistencia de programación: aunque está orientado a seguridad, conserva capacidades de razonamiento y generación de código estándar, útil para tareas de desarrollo con contexto largo (repositorios completos).
- Simulación de adversarios en ejercicios de purple team: el modelo puede actuar como generador de tráfico malicioso o de intentos de intrusión para probar la eficacia de los sistemas de detección.

## Benchmarks y rendimiento

El autor proporciona únicamente resultados de MMLU (logit-mode, argmax sobre A/B/C/D, 1.026 preguntas) comparando el modelo base con la versión abliterada:

| Benchmark | Base (GLM-5.3) | CRACK Abliterated | Diferencia |
|---|---|---|---|
| MMLU (overall) | 85,58% | 84,11% | -1,47 pp |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MATH, etc.) en la información disponible. El autor indica que la capacidad se preserva "dentro de ~1,5 pp" del modelo base, pero no aporta más métricas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 753B parámetros, de los cuales los expertos enrutados están en NVFP4 (4 bits) y la atención/expertos compartidos en bf16. El peso total aproximado es de ~400-450 GB, por lo que se necesitan al menos 8 GPUs con 80 GB de VRAM (p. ej., H100/H200) para cargarlo en memoria.
- GPU recomendadas: NVIDIA Hopper (H100, H200) para aprovechar la ruta Marlin FP4. El autor indica que el backend NVFP4 requiere Hopper; no se menciona soporte para Ampere o Ada Lovelace.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño y a la necesidad de la ruta Marlin FP4.
- Opciones de despliegue: vLLM con `--tensor-parallel-size 8 --moe-backend marlin --tool-call-parser glm47 --reasoning-parser glm45 --enable-auto-tool-choice`. Se requiere FlashInfer >= 0.6.18 para el backend SM90 sparse-MLA.
- Latencia y throughput: no se han publicado datos concretos. Con 8 H100 y decodificación especulativa (MTP), se espera un throughput razonable para un modelo de este tamaño, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | MMLU |
|---|---|---|---|---|---|---|
| GLM-5.3 (base) | 753B | ~18B | 1M | bf16 (original) | MIT | 85,58% |
| GLM-5.3-ABLITERATED-NVFP4 | 753B | ~18B | 1M | NVFP4 | MIT | 84,11% |
| GLM-5.3-Flash (base) | 320B | ~18B | 1M | bf16 (original) | MIT | no disponible |

No se dispone de datos comparativos con otros modelos MoE de tamaño similar (p. ej., DeepSeek-V3, Qwen3-MoE) en la información proporcionada. La comparativa se limita a las variantes de GLM-5.3. La versión Flash (320B) es una alternativa más ligera, pero no se han publicado sus benchmarks en las fuentes consultadas.

## Limitaciones y advertencias

- Uso indebido: al eliminar los rechazos, el modelo puede generar contenido malicioso (ransomware, keyloggers, exploits) que podría utilizarse para actividades ilegales. Solo debe emplearse en entornos autorizados y con fines legítimos de seguridad.
- Sesgos y alucinaciones: aunque el autor reporta ausencia de degeneración, no se han realizado evaluaciones exhaustivas de sesgos ni de fiabilidad en dominios generales. El modelo puede alucinar en tareas complejas o producir código incorrecto en algunos escenarios.
- Idioma: la model card declara únicamente inglés. El rendimiento en otros idiomas no está garantizado y puede ser deficiente.
- Requisitos de hardware: el tamaño del modelo (753B) exige infraestructura de múltiples GPUs de alta gama (H100/H200), lo que limita su uso a entornos empresariales o de investigación con recursos suficientes.
- Dependencia de versiones específicas: requiere vLLM con soporte para NVFP4 y FlashInfer >= 0.6.18; versiones anteriores pueden no funcionar correctamente.
- Sin garantías de soporte: al ser un modelo de terceros (dealignai), no hay soporte oficial de Z.ai. La licencia MIT permite uso comercial, pero el mantenimiento y la corrección de errores dependen del autor.
- Riesgo legal: el uso de herramientas de seguridad ofensiva puede estar regulado en algunas jurisdicciones. El responsable del despliegue debe asegurarse de cumplir la legislación aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dealignai/GLM-5.3-ABLITERATED-NVFP4
- Espejo (UNCENSORED): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-NVFP4
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Sitio de dealignai: https://dealign.ai/
- Documentación de Z.AI sobre GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Repositorio de ejemplo de despliegue con GLM-5.3-Flash (referencia de configuración): https://github.com/drowzeys/keys-vLLm.0.27.1-GLM-5.3-Flash-NVFP4-NVFP4KV-1M-Context-Abliterated
