# AaBbcoder/LumenAct

## Resumen

LumenAct es un repositorio de recursos de inferencia local publicado por el usuario AaBbcoder (proyecto del creador conocido como Lumen_流明_ en Bilibili) que acompaña al visor de expresiones faciales LumenAct. No es un modelo generativo de texto al uso: se trata de un paquete que combina un modelo semántico ONNX de pequeño tamaño (RBT3-Lumen-38M-v6, aproximadamente 38 millones de parámetros) con 97 curvas de animación facial y una malla de referencia de cara en formato Blender. El modelo semántico selecciona una categoría emocional y un contexto, y el visor lee la curva de actuación correspondiente para animar un personaje 3D.

El problema que resuelve es la animación facial local y ligera de avatares (preferentemente VRM) sin depender de servicios en la nube: el modelo semántico y el visor se ejecutan en local, mientras que el LLM de alto nivel y el TTS son elegidos por el usuario y pueden ser locales o remotos. Por su tamaño (repo de 0,2 GB) y su naturaleza (ONNX + assets), está pensado para ejecutarse en equipos de consumo, no en infraestructura de servidor.

Es relevante ahora por su enfoque híbrido de licencias y por su integración con Blender mediante MCP para adaptar el rig a otras caras. Conviene subrayar que no es un modelo cargable con `from_pretrained()` de Transformers ni un servicio de inferencia online, y que su licencia es una mezcla de Apache-2.0, CC BY 4.0 y CC BY-NC 4.0 según el componente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo semántico RBT3-Lumen-38M-v6 exportado a ONNX (no se detalla la arquitectura interna más allá de la designación RBT3) |
| Parametros totales | Aproximadamente 38 M (según el nombre del modelo semántico) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Chino (zh) |
| Licencia | Mixta: `lumenact-mixed-resource-licenses` (Apache-2.0 para pesos semánticos y configuración; CC BY 4.0 para datos de actuación; CC BY-NC 4.0 para la cara de referencia) |
| Formato de pesos | ONNX (modelo semántico) + JSON/curvas de actuación + `.blend` (cara de referencia con 118 shape keys) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

El componente neuronal es RBT3-Lumen-38M-v6, un modelo semántico de unos 38 millones de parámetros entrenado por el autor del proyecto y exportado a ONNX para inferencia local. La model card no detalla la arquitectura interna (si es un transformer encoder tipo RBT3/BERT reducido u otra variante), el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones de decodificación o atención.

El flujo de inferencia es en dos etapas: primero el modelo semántico clasifica la emoción y el contexto a partir de la entrada, y después el visor carga la curva de actuación correspondiente entre las 97 disponibles. La parte de expresión facial no es un segundo modelo generativo ONNX: la mirada básica, el movimiento de ceja individual y las transiciones de reproducción se implementan en código de referencia independiente. El repositorio incluye 166 columnas de control originales, categorías y un directorio de contexto, además de un manifiesto (`asset-manifest.json`) con tamaños, hashes SHA-256 y estado de licencia de cada recurso.

## Capacidades

- Clasificación semántica de emoción y contexto en chino para seleccionar una curva de actuación facial.
- Reproducción de 97 curvas de animación facial predefinidas sobre un personaje 3D.
- Inferencia completamente local del modelo semántico y del visor web.
- Integración con LLM de alto nivel y TTS elegidos por el usuario (locales o remotos) para la capa conversacional.
- Adaptación de personajes en Blender asistida por IA mediante MCP: análisis de dos caras y generación de shape keys homónimas y panel de vinculación de doble modelo, con corrección manual posterior.
- Importación de la cara de referencia `lumen-reference-face.blend` con 118 shape keys directamente en Blender.
- Soporte de destino para personajes VRM humanoides, además de FBX, MMD (PMX/PMD), glTF/GLB y archivos Blender, con conversión a cargo del usuario.
- No incluye tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Animación facial de avatares VRM en local: el modelo semántico elige la emoción y el visor aplica la curva correspondiente, lo que permite animar un personaje sin enviar datos a la nube y con un consumo de recursos mínimo (repo de 0,2 GB).
- Prototipado de VTuber o asistente virtual: se combina el visor con un LLM y un TTS elegidos por el usuario para obtener una capa conversacional completa manteniendo la expresión facial en local.
- Integración en pipelines de Blender: la adaptación asistida por MCP permite analizar una cara propia y generar shape keys homónimas a las de la referencia, útil para reutilizar el set de 97 curvas en personajes nuevos.
- Previsualización rápida de assets de personaje: el visor web sirve para validar geometría, shape keys y curvas de actuación antes de integrar el personaje en un motor de juego o en una producción mayor.
- Docencia y experimentación con animación procedural: al ser recursos abiertos (con matices de licencia), permite estudiar cómo se mapea una clasificación semántica de emoción a curvas de animación concretas.
- Desarrollo de herramientas de accesibilidad o interfaces expresivas: el bajo coste del modelo semántico (38 M de parámetros en ONNX) permite ejecutarlo en equipos modestos para dar feedback expresivo a un avatar en tiempo real.
- Base para investigación en control facial basado en texto: las 166 columnas de control y las categorías documentadas permiten construir y evaluar mapeos alternativos entre emoción y parámetros de rig.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo semántico (38 M de parámetros en ONNX) y el total del repositorio (0,2 GB), la huella es muy reducida y cabe en equipos de consumo.
- GPU recomendadas: no se especifican; el diseño es de inferencia local, por lo que se espera funcionamiento en CPU y en GPU de gama consumer.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con unos pocos GB de memoria; no se documentan requisitos mínimos.
- Opciones de despliegue: ONNX Runtime para el modelo semántico y el visor web incluido en el repositorio de GitHub (`start_preview.bat` / `start_preview.sh`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (recursos de animación facial local con clasificador semántico ONNX de pequeño tamaño y licencia mixta).

## Limitaciones y advertencias

- No es un modelo generativo cargable con `from_pretrained()` de Transformers ni un servicio de inferencia online; es un repositorio de recursos para un visor local concreto.
- El modelo semántico solo está entrenado y documentado para chino (zh); no se garantiza su comportamiento en otros idiomas.
- La licencia es mixta y no uniforme: los pesos semánticos y la configuración son Apache-2.0, los datos de actuación son CC BY 4.0 y la cara de referencia es CC BY-NC 4.0. No se puede tratar todo el repositorio como Apache o MIT.
- La cara de referencia y sus adaptaciones que contengan geometría o texturas protegidas no pueden usarse comercialmente por terceros sin autorización expresa de los titulares; la licencia MIT del código del visor no cubre estos recursos.
- El repositorio no incluye ni autoriza el personaje completo de Lumen ni el proyecto principal; el runtime privado del proyecto no está incluido.
- La adaptación de personajes requiere intervención humana: el panel generado por IA debe corregirse ítem por ítem, y el paquete no incluye plugin de calibración.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad del clasificador semántico, por lo que no hay garantías cuantitativas para producción.
- El soporte de formatos de entrada (VRM, FBX, MMD, glTF/GLB, Blender) se refiere al destino de adaptación, no a un importador universal en el visor web.
- Riesgo de dependencia de la revisión concreta del repositorio: el script de descarga fija la revisión `a25bab58a259cb3d24fd27ef896467451ca5d6d1`, y las versiones del visor y de los assets deben coincidir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AaBbcoder/LumenAct
- Código fuente del visor en GitHub: https://github.com/AaBb-coder/LumenAct
- Aviso de licencias de pesos y datos: https://huggingface.co/AaBbcoder/LumenAct/blob/main/models/ASSET_NOTICE.md
- Aviso de licencias de la cara de referencia: https://huggingface.co/AaBbcoder/LumenAct/blob/main/assets/reference-face/ASSET_NOTICE.md
- Tutorial de adaptación de personajes: https://huggingface.co/AaBbcoder/LumenAct/blob/main/docs/ADAPTING_YOUR_MODEL.md
