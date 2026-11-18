# KRAFTON/Raon-1-mini-preview-mlx

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, el brazo de investigación en IA del editor de videojuegos surcoreano KRAFTON. Con 28.800 millones de parámetros totales y solo 4.300 millones activos por token, está diseñado específicamente para destacar en conversación en coreano y en tareas agénticas, además de ofrecer razonamiento con modo de pensamiento integrado. La versión aquí descrita (`KRAFTON/Raon-1-mini-preview-mlx`) son los pesos cuantizados a NVFP4 para Apple Silicon, distribuidos a través de la librería MLX.

El modelo emplea una arquitectura híbrida de atención que combina 18 capas de Raon Delta Attention (RDA), una variante de Kimi Delta Attention con compuertas de borrado y escritura desacopladas, con 7 capas de Gated MLA. Esta disposición reduce drásticamente el coste de caché KV en contextos largos: solo las capas MLA mantienen caché, a unos 8 KiB por token en BF16. El contexto nativo alcanza los 262.144 tokens y el vocabulario es especialmente amplio (259.840 tokens), lo que refleja el foco en coreano e inglés.

La relevancia actual del modelo radica en tres factores: su licencia Apache 2.0 sin restricciones para uso comercial, su capacidad de ejecutarse en una única GPU de consumo (RTX 5090 de 32 GB en NVFP4) gracias a su naturaleza MoE dispersa, y su soporte de decodificación especulativa mediante un modelo borrador DFlash2. No obstante, se trata de una versión preview, por lo que las especificaciones y resultados pueden cambiar antes del lanzamiento final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (18 capas Raon Delta Attention + 7 capas Gated MLA) |
| Parametros totales | 28.800 millones (28.783.227.618 según safetensors) |
| Parametros activos | 4.300 millones (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (esta versión MLX); MXFP8 y NVFP4 en el modelo base |
| Idiomas soportados | Coreano e inglés (no se detallan otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, cuantizado NVFP4) |

## Arquitectura y entrenamiento

Raon-1 mini es un transformer MoE disperso con 25 capas, tamaño oculto de 2.560 y 40 cabezas de atención tanto en RDA como en Gated MLA. La dimensión de cabeza es de 128 para RDA y de 192 (QK) / 128 (V) para Gated MLA, con rangos LoRA de 576/512 en query/KV para esta última. Cada token activa 6 de los 128 expertos enrutados más un experto compartido, con tamaño intermedio de experto de 1.088; la primera capa es un FFN denso de 12.032. La función de activación es SiTU-GLU y el LM head no está atado (untied) al embedding.

La innovación arquitectónica principal es Raon Delta Attention (RDA), que desacopla las compuertas de borrado y escritura de Kimi Delta Attention para mejorar el rendimiento en contexto largo. A ello se suma Raon-mHC, una versión optimizada de las hyper-connections con restricción de variedad (mHC) de DeepSeek que reduce el coste computacional y acelera el entrenamiento. El modelo no usa codificación posicional (NoPE). El entrenamiento se realizó desde cero, aunque la información disponible no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Sí se menciona soporte de decodificación especulativa mediante un modelo borrador DFlash2.

## Capacidades

- Generación de texto conversacional con calidad destacada en coreano y sólida en inglés.
- Razonamiento con modo de pensamiento integrado (built-in thinking), con buenos resultados en matemáticas y ciencias según el autor.
- Seguimiento de instrucciones y tareas de búsqueda (search), donde lidera frente a los modelos de comparación según la model card.
- Ejecución agéntica con tool calling / function calling, con soporte explícito para Hermes Agent, Pi y OpenCode.
- Razonamiento multi-paso para flujos agénticos.
- Contexto largo nativo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa acelerada mediante el modelo borrador DFlash2.
- Capacidades multilingües limitadas a coreano e inglés según la información disponible.

## Casos de uso

- Atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo el hilo de la conversación y el historial del cliente sin truncamientos frecuentes.
- Agentes autónomos con tool calling: integrable en frameworks como Hermes Agent, Pi u OpenCode para orquestar llamadas a APIs, consultas a bases de datos y ejecución de acciones encadenadas en pipelines de automatización.
- Asistente de razonamiento matemático y científico: el modo de pensamiento integrado permite usarlo en tutorización, resolución de problemas paso a paso y verificación de cálculos en entornos educativos o de investigación.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto puede resumir, extraer información y responder preguntas sobre contratos, informes técnicos o expedientes completos en una sola pasada.
- Búsqueda aumentada (RAG) y motores de búsqueda conversacionales: su rendimiento destacado en benchmarks de search lo hace adecuado para responder consultas sobre corpus recuperados, combinando recuperación y generación en un mismo paso.
- Inferencia local en Apple Silicon: la versión MLX cuantizada a NVFP4 permite desplegar el modelo en Macs con chip Apple para prototipado, desarrollo offline y aplicaciones de escritorio con privacidad de datos.
- Generación de código asistida en entornos de desarrollo: el soporte de tool calling y agentes permite integrarlo en asistentes de IDE que consultan repositorios, ejecutan tests y proponen parches dentro de un flujo multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona gráficas comparativas (`raon_benchmarks_top6.png`) frente a modelos abiertos en matemáticas, ciencias, seguimiento de instrucciones y búsqueda, pero los valores concretos no se incluyen en el texto extraído, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada: la versión NVFP4 está pensada para caber en una única NVIDIA RTX 5090 de 32 GB, según la model card. El repositorio MLX ocupa 18,7 GB, lo que da una idea del espacio en disco necesario para los pesos cuantizados.
- GPU recomendadas: RTX 5090 (32 GB) para NVFP4; para MXFP8 o BF16 se requeriría hardware con más memoria (A100, H100, H200), aunque no se especifican cifras exactas.
- GPU de consumo: sí, cabe en la RTX 5090 en NVFP4. Para Apple Silicon, la versión MLX está diseñada para ejecutarse en chips Apple con memoria unificada suficiente (no se detalla el mínimo).
- Opciones de despliegue: MLX para Apple Silicon; el modelo base admite despliegue con frameworks estándar de inferencia (vLLM, TGI, llama.cpp) según el formato, aunque la información disponible no confirma integraciones específicas.
- Latencia y throughput: no disponibles. La decodificación especulativa con DFlash2 está orientada a reducir la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 mini preview | 28,8B / 4,3B | 262.144 | Apache 2.0 | Hugging Face (acceso bajo solicitud) |
| Alternativas MoE de ~30B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada, por lo que no se ofrece una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Es una versión preview, no un modelo final: las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso está restringido mediante un formulario (gated model) que solicita nombre, afiliación, puesto, país y uso previsto, aunque la licencia sea Apache 2.0.
- Idiomas soportados limitados a coreano e inglés; el rendimiento en otras lenguas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de búsqueda y razonamiento abierto; no se documentan tasas de error.
- No se detallan sesgos conocidos ni evaluaciones de seguridad o alineación en la información disponible.
- El contexto de 262.144 tokens es nativo, pero el rendimiento efectivo en ventanas extremas no está cuantificado en la documentación.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el formulario de acceso condiciona la descarga; conviene revisar los términos del repositorio antes de integrarlo en producción.
- La versión MLX está cuantizada a NVFP4, lo que puede introducir una pérdida de calidad respecto al modelo en BF16; no se publican métricas de degradación por cuantización.

## Enlaces

- Repositorio Hugging Face (MLX): https://huggingface.co/KRAFTON/Raon-1-mini-preview-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Repositorio GitHub del modelo: https://github.com/krafton-ai/Raon-1-mini-preview
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
