# sensenova/SenseNova-Loop-9B-Preview

## Resumen

SenseNova-Loop-9B-Preview es un modelo lingüístico multimodal desarrollado por SenseNova (sensenova) orientado a flujos de trabajo de contexto largo y agentes. Acepta texto e imágenes como entrada y genera texto, lo que lo hace apto para tareas que combinan comprensión de documentos, programación e interacción con herramientas externas. Su rasgo más distintivo es la arquitectura: un decodificador con bloque en bucle (looped transformer) que reutiliza pesos, combinado con hiperconexiones restringidas a variedad de dos flujos (mHC).

La relevancia del modelo reside en que consigue una ruta de ejecución más profunda (56 ejecuciones de capa decodificadora por pasada) almacenando solo 32 conjuntos de pesos de capa, es decir, alrededor de 9B de parámetros totales con unos 14,6B de parámetros de inferencia. Esto reduce el coste de memoria respecto a un modelo denso equivalente en profundidad de ejecución. Se publica como preview bajo licencia Apache 2.0, con pesos en safetensors y soporte en la librería transformers mediante código personalizado.

El entrenamiento documentado incluye recetas con secuencias largas, entradas multimodales y trayectorias de tareas supervisadas, con una longitud máxima de secuencia de entrenamiento de 262.144 tokens, lo que lo posiciona como candidato para casos de uso agénticos y de documentos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador autorregresivo multimodal; bloque en bucle con mHC de dos flujos |
| Parametros totales | 9.656.250.480 (~9B) |
| Parametros activos | no disponible (no es MoE; ~14,6B de parámetros de inferencia por reutilización de pesos en el bucle) |
| Longitud de contexto | Hasta 262.144 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (precisión de exportación: BF16 en el backbone, FP32 en parámetros de enrutamiento mHC) |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (38,2 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo se construye sobre un decodificador multimodal de 32 capas distintas. Las capas 0–3 procesan la entrada; a continuación, el bloque formado por las capas 4–27 se aplica dos veces de forma secuencial con pesos compartidos (computación B(B(h))); finalmente, las capas 28–31 y la cabeza de salida generan el resultado. En inferencia esto supone 56 ejecuciones de capa decodificadora por pasada hacia adelante almacenando solo 32 conjuntos de pesos. La atención es híbrida: en cada grupo de cuatro capas se intercalan tres capas de atención lineal y una de atención completa, un patrón que reduce el coste de contexto largo manteniendo atención global periódica.

El segundo componente clave son las hiperconexiones restringidas a variedad de dos flujos (manifold-constrained hyper-connections, mHC): mapas aprendidos que enrutan y combinan la información entre dos flujos residuales en la sección en bucle, gestionando el flujo de información entre las dos pasadas del bloque compartido. En cuanto al entrenamiento, la model card documenta recetas que combinan secuencias largas, entradas multimodales (texto, imágenes, código) y trayectorias de tareas supervisadas, con una longitud máxima de secuencia de 262.144 tokens. No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline image-text-to-text, formato conversacional).
- Comprension multimodal: acepta imagenes y texto como entrada conjunta.
- Comprension de documentos largos gracias al contexto de entrenamiento de hasta 262.144 tokens y la atencion hibrida.
- Generacion y comprension de codigo (los ejemplos de la model card incluyen simulaciones y analisis de datos con codigo).
- Interaccion con herramientas externas: el entrenamiento incluye trayectorias de tareas con uso de herramientas, orientado a flujos agenticos.
- Diseño de presentaciones: los ejemplos publicados muestran generacion de diapositivas (PPT) y motion design.
- Analisis de datos: ejemplos de simulacion de misiones lunares y analisis de consumo energetico con telemetria y graficas.
- Soporte bilingue ingles/chino.
- Uso de contexto largo en flujos multi-paso agenticos (benchmarks agenticos como WorkBuddy Bench, AIDABench o Terminal Bench 2.1 aparecen en la evaluacion).

## Casos de uso

- Comprension de documentos extensos: con contexto de entrenamiento de 262.144 tokens y atencion hibrida lineal/completa, puede procesar informes, contratos o documentacion tecnica de decenas de paginas combinando texto e imagenes (capturas, diagramas) en una sola peticion.
- Agentes de terminal y automatizacion: su evaluacion incluye Terminal Bench 2.1 y benchmarks de automatizacion, y su entrenamiento con trayectorias de herramientas lo hace adecuado para agentes que ejecutan comandos, navegan archivos y realizan tareas multi-paso.
- Asistentes de analisis de datos: los ejemplos de la model card muestran analisis de consumo energetico y simulaciones orbitales, lo que sugiere utilidad en pipelines de analisis donde el modelo genera codigo, interpreta resultados y produce visualizaciones.
- Generacion de presentaciones: los ejemplos de PPT (presentaciones docentes, de viajes y de producto) indican que puede generar diapositivas estructuradas a partir de instrucciones e imagenes de referencia.
- Atencion al cliente multimodal: puede gestionar conversaciones multi-turno con capturas de pantalla o documentos adjuntos del usuario, aprovechando la entrada imagen-texto y el contexto largo para mantener el historial completo del caso.
- Asistencia de codigo en repositorios grandes: el contexto largo permite indexar archivos extensos o multiples ficheros en la ventana, y la capacidad agéntica facilita integraciones con herramientas de desarrollo y revision de pull requests con imagenes (capturas de errores).
- Motion design y contenido animado: los ejemplos de motion design sugieren aplicacion en generacion de guiones y especificaciones para animacion, combinando descripcion textual e imagenes de estilo.

## Benchmarks y rendimiento

La model card publica resultados comparativos (en formato imagen) en los benchmarks BIRD-Dev, WorkBuddy Bench, AIDABench, TeamBench, Terminal Bench 2.1, T³-Banking, AutomationBench y RaccoonPPTBench. Sin embargo, la informacion disponible no incluye los valores numericos de estos resultados, por lo que no es posible reproducirlos en una tabla. No se han publicado cifras de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia, el repositorio pesa 38,2 GB en safetensors (BF16 en el backbone, FP32 en los parametros de enrutamiento mHC), por lo que una carga completa en BF16 requeriria del orden de 40 GB de VRAM o memoria unificada.
- GPU recomendadas: no disponible explicitamente; por el tamaño en BF16, una unica A100 u H100 de 80 GB, o una A100 de 40 GB en configuracion ajustada, serian candidatas razonables.
- Consumer GPUs: no hay cuantizaciones publicadas (GGUF u otras), por lo que de momento no es viable su ejecucion en GPUs de consumo tipicas (24 GB) sin cuantizacion; habria que esperar a exportaciones de la comunidad.
- Despliegue: la model card recomienda usar el entorno de despliegue y los parametros de configuracion documentados por SenseNova. El modelo usa arquitectura personalizada (sensenova_loop) con custom_code en transformers; no se menciona soporte nativo de vLLM, llama.cpp, Ollama o TGI. El repositorio de GitHub (OpenSenseNova/SenseNova-Loop) es la referencia para instrucciones de despliegue.
- Latencia y throughput: no disponibles. El diseño en bucle implica 56 ejecuciones de capa por pasada, y el patron de atencion hibrida (3 lineales por 1 completa) esta pensado para mitigar el coste en contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview | ~9B (14,6B de inferencia) | 262.144 (entrenamiento) | Si (imagen-texto a texto) | Apache 2.0 | Looped transformer + mHC, atencion hibrida |
| Qwen2.5-VL-7B-Instruct | ~7B | 128.000 | Si (imagen-texto a texto) | Apache 2.0 | Decodificador denso estandar, ecosistema amplio |
| InternVL3-8B | ~8B | 32.000 (tipico) | Si (imagen-texto a texto) | Apache 2.0 | Vision-linguistico denso, buen rendimiento OCR |
| MiniCPM-V 2.6 (~8B) | ~8B | 32.000 (tipico) | Si (imagen-texto a texto) | Uso comunitario con condiciones | Eficiente en dispositivos de gama alta |

Nota: la comparativa se basa en caracteristicas publicas conocidas de los modelos alternativos; los datos concretos de rendimiento entre ellos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es una version preview: la model card marca el informe tecnico como TBD, por lo que la documentacion de arquitectura y entrenamiento puede cambiar.
- Se recomienda explicitamente usar el entorno de despliegue y la configuracion documentados por SenseNova; el rendimiento fuera de esa configuracion no esta garantizado.
- La arquitectura (sensenova_loop) requiere custom_code en transformers, lo que implica cargar codigo remoto y puede no ser compatible con librerias de inferencia optimizadas (vLLM, llama.cpp) sin adaptaciones.
- No hay cuantizaciones publicadas, lo que limita el despliegue en hardware de consumo.
- Idiomas limitados a ingles y chino; el rendimiento en otros idiomas no esta documentado.
- Sesgos, tasas de alucinacion y evaluaciones de seguridad: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero al ser una preview conviene revisar la licencia del repositorio de GitHub ante futuras actualizaciones.
- El bucle con pesos compartidos duplica el coste de computo por pasada (56 ejecuciones de capa frente a 32), lo que afecta a la latencia respecto a un modelo denso de 32 capas.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Repositorio de GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia Apache 2.0 (GitHub): https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Configuracion de arquitectura (GitHub): https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/config.json
- Model card en chino: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview/blob/main/README_CN.md
- Informe tecnico: no disponible (marcado como TBD en la model card)
