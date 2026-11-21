# hiehdrb/plamo-3-translate-2b-webgpu

## Resumen

PLaMo 3 Translate 2B for WebGPU es una conversión a ONNX del modelo de traducción PLaMo 3 Translate 2B de Preferred Networks, preparada por el usuario hiehdrb para ejecutarse íntegramente en el navegador mediante transformers.js y onnxruntime-web sobre WebGPU. El objetivo es claro: llevar un modelo de traducción de 2.000 millones de parámetros al cliente, sin servidor ni backend, con un peso total de 1,51 GB en cuantización de 4 bits.

El modelo traduce entre inglés, japonés y coreano en las seis direcciones posibles. Es la pieza de traducción de Subbed, una extensión de navegador de Repvantage, LLC que muestra subtítulos traducidos de vídeos procesándolos localmente en el ordenador del usuario. No se trata de una publicación oficial de Preferred Networks, sino de una distribución comunitaria que reutiliza los pesos W4A16 oficiales del modelo original.

La relevancia de esta ficha está en su enfoque de despliegue: cuantización q4f16, formato ONNX con datos externos, contexto limitado a 2048 tokens y una licencia comunitaria con condiciones comerciales específicas. Es un caso representativo de inferencia local en navegador para una tarea acotada de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Plamo3ForCausalLM); `config.json` declara `model_type: qwen3` solo por compatibilidad de carga con transformers.js |
| Parametros totales | 2B (según nombre del modelo base; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | q4f16 (pesos de 4 bits, activaciones de 16 bits) |
| Idiomas soportados | en, ja, ko |
| Licencia | PLaMo Community License |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx` + `onnx/model_q4f16.onnx_data`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia PLaMo 3, identificado en el grafo como `Plamo3ForCausalLM`. Esta distribución no reentrena ni modifica los pesos: parte de los pesos cuantizados oficiales de Preferred Networks (`pfnet/plamo-3-translate-2b-W4A16`) y los inserta byte a byte en un grafo ONNX comunitario para WebGPU (`chiro0318/plamo-3-translate-2b-onnx-webgpu`), con pequeños ajustes de entrada para transformers.js. El tokenizador es el original de Preferred Networks, idéntico byte a byte al del modelo de 0,8B.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es el pipeline de conversión: cuantización W4A16 oficial, empaquetado ONNX con datos externos (`onnx_data` de 1,51 GB) y ejecución en navegador vía WebGPU, con verificación de integridad por tamaño y SHA-256 de cada fichero.

## Capacidades

- Traducción entre inglés, japonés y coreano en las seis direcciones del par trilingüe.
- Generación de texto condicionada al formato de prompt propio de PLaMo 3 Translate.
- Ejecución local en navegador con WebGPU, sin envío de datos a servidores externos.
- Integración con transformers.js mediante `dtype: "q4f16"` en el dispositivo WebGPU.
- Capacidad multilingüe limitada a en, ja y ko; no se declaran otros idiomas.
- No se documentan tool calling, function calling, modo thinking, visión ni audio.

## Casos de uso

- Subtitulado de vídeo en el navegador: la extensión Subbed descarga estos ficheros y traduce los subtítulos en el equipo del usuario, lo que evita enviar audio o texto a un servicio remoto y reduce el coste de infraestructura.
- Traducción de documentación técnica entre inglés y japonés: con 2048 tokens de contexto se pueden procesar secciones y párrafos completos, adecuado para manuales y READMEs.
- Localización de interfaces y cadenas de UI: al ejecutarse en el cliente, permite traducir textos cortos bajo demanda sin latencia de red ni cuotas de API.
- Herramientas de accesibilidad para contenido en coreano o japonés: traducción en tiempo real de transcripciones y notas para usuarios que consumen vídeo o texto en esos idiomas.
- Procesamiento por lotes de textos breves en el navegador: traducción de correos, mensajes o formularios dentro de una aplicación web que prioriza la privacidad de los datos.
- Prototipado y demos de traducción sin backend: investigadores y desarrolladores pueden evaluar un modelo de traducción de 2B directamente en una página web, sin GPU dedicada ni servidor de inferencia.

## Benchmarks y rendimiento

| Benchmark | Este modelo (q4f16 ONNX) | Modelo original 16 bits |
|---|---:|---:|
| WMT24++ (720 líneas, 6 direcciones en/ja/ko, COMET-22) | 0.8549 | 0.8566 |

La diferencia de 0,0017 puntos COMET-22 respecto al original de 16 bits indica una degradación mínima por la cuantización a 4 bits en esta tarea. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 1,51 GB; la inferencia en WebGPU requiere memoria de GPU del orden de 2 GB o superior, dependiendo del navegador y del backend.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño; la viabilidad depende del soporte WebGPU del navegador y del sistema operativo.
- Opciones de despliegue: transformers.js con onnxruntime-web sobre WebGPU; también puede ejecutarse en entornos ONNX Runtime fuera del navegador, aunque no está documentado.
- Latencia y throughput: no disponibles. La model card advierte que la salida en coreano requiere más pasos por carácter que el japonés, porque el vocabulario de PLaMo tiene pocas sílabas coreanas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B WebGPU (este) | 2B | 2048 | en, ja, ko | PLaMo Community License | ONNX q4f16 |
| pfnet/plamo-3-translate-2b (original) | 2B | no disponible | en, ja, ko | PLaMo Community License | safetensors |
| pfnet/plamo-3-translate-2b-W4A16 | 2B | no disponible | en, ja, ko | PLaMo Community License | cuantizado W4A16 |
| chiro0318/plamo-3-translate-2b-onnx-webgpu | 2B | no disponible | en, ja, ko | no disponible | ONNX WebGPU |

No se dispone de datos de benchmarks de los modelos comparables distintos del original de 16 bits, ya recogido en la tabla anterior.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a inglés, japonés y coreano; no se declaran otros idiomas.
- El modelo es una conversión no oficial; Preferred Networks no respalda esta distribución.
- La etiqueta `qwen3` en el Hub y en `config.json` es un artificio de compatibilidad con transformers.js, no refleja la arquitectura real.
- La salida en coreano es menos eficiente por carácter debido al vocabulario del tokenizador.
- Riesgo de alucinación y de errores de traducción en dominios especializados; no se documentan evaluaciones por dominio.
- Licencia: uso personal y académico gratuito; el uso comercial exige registro previo con Preferred Networks y solo se permite con ingresos anuales iguales o inferiores a 1.000 millones de yenes.
- La redistribución exige copia de la licencia, la mención "Built with PLaMo" y "PLaMo" en el nombre del modelo.
- Las traducciones pueden publicarse sin etiqueta PLaMo, salvo cuando constituyan todo o la mayor parte de un libro, artículo o publicación similar, que debe indicar el uso de PLaMo.
- Quien comparta traducciones debe advertir de que la licencia se aplica a cualquier modelo de IA entrenado con ellas.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hiehdrb/plamo-3-translate-2b-webgpu
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Pesos cuantizados oficiales: https://huggingface.co/pfnet/plamo-3-translate-2b-W4A16
- Grafo ONNX comunitario: https://huggingface.co/chiro0318/plamo-3-translate-2b-onnx-webgpu
- Extensión Subbed: https://subbedai.app
- Formulario de registro comercial: https://forms.gle/mTL8tBLrMYXKNZD56
