# nvidia/Kimi-K3-NVFP4

## Resumen

El modelo NVIDIA Kimi-K3-NVFP4 es la versión cuantizada en FP4 del modelo Kimi-K3 de Moonshot AI, un modelo de lenguaje autorregresivo de arquitectura transformer optimizada con mezcla de expertos (MoE). Está diseñado para tareas de codificación de largo alcance, trabajo de conocimiento integral, desarrollo de videojuegos, razonamiento profundo y agentes visuales. El checkpoint cuantizado contiene 1,42 billones de parámetros según los safetensors, aunque la model card declara 2,8 billones en total, y ofrece una ventana de contexto nativa de 1.048.576 tokens.

La cuantización ha sido realizada por NVIDIA con Model Optimizer v0.45.0, convirtiendo los pesos de los expertos de MXFP4 a NVFP4 sin usar datos de calibración, y cuantizando las proyecciones de atención a FP8 por bloques de 128×128. El modelo es nativamente multimodal (texto, imagen y vídeo) y está optimizado para ejecutarse en GPUs NVIDIA Blackwell B200 y B300 con vLLM, con caché KV en FP8 y enrutamiento de expertos consciente de KV.

La relevancia de este lanzamiento radica en ofrecer una versión lista para producción de un modelo de escala billonaria con cuantización FP4, lo que reduce significativamente los requisitos de memoria y acelera la inferencia en hardware Blackwell. Está disponible bajo la licencia NVIDIA Open Model Agreement para uso comercial y no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Kimi Delta Attention (KDA), Attention Residuals (AttnRes) y Stable LatentMoE |
| Parametros totales | 1.418.561.422.080 (safetensors); la model card declara 2,8 T |
| Parametros activos | 16 de 896 expertos activados por token (numero de parametros activos no especificado) |
| Longitud de contexto | 1.048.576 tokens nativos |
| Tipos de cuantizacion | NVFP4 (expertos), FP8 por bloques 128×128 (proyecciones de atencion) |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El Kimi-K3 es un modelo hibrido de 93 capas: 69 capas con Kimi Delta Attention (KDA) y 24 capas con Multi-head Latent Attention (MLA). Incorpora Attention Residuals (AttnRes) y Stable LatentMoE como mecanismos de mezcla de expertos, con 896 expertos de los cuales 16 se activan por token. Incluye ademas una torre de vision multimodal que procesa imagenes y video.

El proceso de cuantizacion realizado por NVIDIA no utilizo datos de calibracion ni entrenamiento adicional. Los pesos de los expertos se convirtieron de MXFP4 a NVFP4 con input_scale=1.0, y las proyecciones de atencion se cuantizaron directamente a FP8 con bloques de 128×128. El modelo esta optimizado para ejecutarse con vLLM en GPUs Blackwell B200/B300, con caché KV en FP8 y enrutamiento de expertos consciente de KV. Los datos de entrenamiento del modelo original no han sido divulgados por Moonshot AI.

## Capacidades

- Generacion de texto y razonamiento profundo con modo de razonamiento siempre activo (always-on reasoning)
- Codificacion de largo alcance: generacion y edicion de codigo en proyectos extensos
- Multimodal nativo: entrada de texto, imagen y video; salida de texto
- Soporte de tool calling y function calling para integracion con APIs y herramientas externas
- Capacidades de agente: coordinacion de instrucciones y ejecucion de tareas multi-paso
- Razonamiento de contexto largo: ventana nativa de 1.048.576 tokens, con longitud de completado configurable hasta el mismo limite
- Capacidades multilingues: no confirmadas en la documentacion disponible

## Casos de uso

- Desarrollo de videojuegos: el modelo puede generar codigo de juego, disenar mecanicas y procesar assets visuales gracias a su multimodalidad y ventana de contexto de 1 M de tokens, permitiendo mantener todo el proyecto en contexto durante sesiones de desarrollo prolongadas.

- Agentes visuales en produccion: su capacidad de procesar imagenes y video junto con tool calling permite construir agentes que analizan capturas de pantalla, videos de demostracion o interfaces de usuario y ejecutan acciones en consecuencia, por ejemplo en automatizacion de pruebas de software.

- Trabajo de conocimiento integral: con 1 M de tokens de contexto, puede procesar documentos corporativos completos, contratos o informes extensos y generar resumenes, analisis o respuestas fundamentadas sin necesidad de dividir el documento en fragmentos.

- Codificacion de largo alcance en CI/CD: integrable en pipelines de integracion continua para revision de codigo, generacion de tests y correccion de bugs en repositorios extensos, manteniendo el contexto del proyecto completo.

- Razonamiento cientifico y tecnico: evaluado en GPQA Diamond (razonamiento a nivel de posgrado) y SciCode (codificacion cientifica), es adecuado para investigacion, analisis tecnico avanzado y resolucion de problemas cientificos complejos.

- Agentes de terminal y telecomunicaciones: evaluado en Terminal-Bench 2.1 y Tau2-bench Telecom, puede operar herramientas de terminal, gestionar tareas de administracion de redes y sistemas, y ejecutar flujos de trabajo de ingenieria de software desde la linea de comandos.

- Asistencia multimodal en atencion al cliente: procesa capturas de pantalla, videos de errores o documentos adjuntos junto con conversaciones de texto para diagnosticar problemas tecnicos y generar respuestas con contexto visual.

## Benchmarks y rendimiento

El modelo fue evaluado en los siguientes conjuntos de datos, pero no se han publicado los resultados numericos en la informacion disponible:

| Benchmark | Dominio |
|---|---|
| GPQA Diamond | Razonamiento a nivel de posgrado |
| SciCode | Codificacion cientifica |
| Tau2-bench Telecom | Agentes de telecomunicaciones con herramientas |
| MMMU-Pro | Razonamiento multimodal |
| AA-LCR | Razonamiento de contexto largo |
| Terminal-Bench 2.1 | Tareas de ingenieria de software en terminal |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: GPUs NVIDIA Blackwell B200 y B300
- Configuracion de prueba declarada: 8 GPUs NVIDIA Blackwell B300
- VRAM estimada: no disponible; el checkpoint cuantizado en FP4 ocupa aproximadamente 1,4 TB en disco (repo de 1610 GB), por lo que se requiere un nodo multi-GPU con al menos 1,5 TB de VRAM combinada
- No cabe en GPUs de consumo (RTX 4090 o similares)
- Runtime soportado: vLLM (unico motor declarado)
- Caché KV en FP8 para reducir uso de memoria
- Despliegue recomendado: nodos GB200 o GB300 NVL72 con NVLink, con posible desagregacion prefill/decode
- Latencia y throughput: no disponibles

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|
| Kimi-K3 (Moonshot AI) | 2,8 T | 1.048.576 | Kimi K3 License | Original (sin cuantizar) |
| NVIDIA Kimi-K3-NVFP4 | 1,42 T (safetensors) / 2,8 T (declarados) | 1.048.576 | NVIDIA Open Model Agreement | NVFP4 + FP8 |

La comparativa con otros modelos de la misma categoria (MoE multimodales de escala billonaria) no esta disponible en la informacion proporcionada. El modelo original Kimi-K3 de Moonshot AI es la referencia principal, y la diferencia de parametros entre el checkpoint cuantizado y la cifra declarada de 2,8 T no esta explicada en la documentacion.

## Limitaciones y advertencias

- La licencia NVIDIA Open Model Agreement tiene terminos especificos que deben revisarse antes de uso comercial; se aplican restricciones adicionales de la licencia Kimi K3 de Moonshot AI
- Requiere hardware NVIDIA Blackwell (B200/B300); no es compatible con GPUs de generaciones anteriores
- No se han documentado sesgos especificos en la informacion disponible, pero al ser un modelo de gran escala entrenado con datos no divulgados, pueden existir sesgos no identificados
- Riesgo de alucinacion inherente a modelos autorregresivos de lenguaje, especialmente en tareas de razonamiento de contexto largo
- Los datos de entrenamiento son no divulgados (undisclosed), lo que dificulta la auditoria de procedencia y calidad de los datos
- No se han publicado resultados numericos de benchmarks, lo que impide una evaluacion cuantitativa independiente del rendimiento
- El despliegue requiere infraestructura de servidor de alta gama; no es viable en hardware de consumo
- La discrepancia entre los parametros contabilizados en safetensors (1,42 T) y los declarados en la model card (2,8 T) no esta documentada

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Kimi-K3-NVFP4
- Modelo base Kimi-K3 (Moonshot AI): https://huggingface.co/moonshotai/Kimi-K3
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Tracking de soporte de kernels FlashInfer: https://github.com/flashinfer-ai/flashinfer/issues/4568
- Documentacion de despliegue NVIDIA Dynamo: https://docs.nvidia.com/dynamo/dev/recipes/kimi-k3
- Hilo en foros de NVIDIA Developer: https://forums.developer.nvidia.com/t/kimi-k3/377093
