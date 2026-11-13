# codebucketsolutions/bolo-syspin-magahi-male

## Resumen

`bolo-syspin-magahi-male` es una voz sintetica de texto a voz (TTS) para magahi, una lengua indoaria oriental hablada principalmente en Bihar (India). No se trata de un modelo de lenguaje generativo, sino de un modelo acustico VITS convertido a ONNX para su uso con sherpa-onnx. Lo publica `codebucketsolutions` como parte del proyecto bolo, un servidor de voz que funciona sin PyTorch y que distribuye voces mediante un comando `pull`.

El modelo original es `SYSPIN/vits_Magahi_Male`, desarrollado por el proyecto SYSPIN del SPIRE Lab (Indian Institute of Science, Bengaluru). Este repositorio no entrena nada: es una conversion de formato del checkpoint Coqui VITS a ONNX mediante `tools/voices/export_syspin.py` del proyecto bolo. Los pesos son identicos a los originales.

Su relevancia es doble: por un lado, aporta cobertura TTS para una lengua de bajos recursos como el magahi, con muy pocos recursos de sintesis disponibles; por otro, su empaquetado ONNX permite desplegarlo en entornos sin GPU y sin PyTorch, lo que reduce drasticamente la huella de dependencias en produccion. El repositorio ocupa aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS), convertido a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; la longitud de entrada la fija el texto a sintetizar) |
| Tipos de cuantizacion | no disponible (el repo contiene el grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | mag (magahi) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 (corpus SYSPIN) |
| Formato de pesos | ONNX (sherpa-onnx) |
| Genero de la voz | masculino |
| Tamano del repositorio | ~0,1 GB |
| Runtime | sherpa-onnx (sin PyTorch) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo durante el entrenamiento. Permite generar audio de forma directa desde texto, sin pipeline separado de alineamiento y vocoder, y admite control de duracion y de variabilidad en la prosodia. El modelo original esta implementado en Coqui TTS; esta publicacion es unicamente el grafo exportado a ONNX para sherpa-onnx.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se aplicaron etapas de ajuste fino. Lo unico documentado es que los datos proceden del corpus TTS SYSPIN del IISc, bajo licencia CC-BY-4.0, y que la conversion no implico reentrenamiento ni modificacion de pesos. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Sintesis de voz a partir de texto en magahi, con voz masculina.
- Generacion de audio end-to-end sin vocoder externo (propio de VITS).
- Inferencia sobre ONNX Runtime, sin dependencia de PyTorch.
- Integracion nativa con sherpa-onnx y con el servidor bolo mediante `bolo pull syspin-mag-male`.
- Control de velocidad y prosodia segun los parametros expuestos por sherpa-onnx (no documentados en la model card).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: no es un modelo de lenguaje.
- No soporta vision ni audio de entrada; es exclusivamente texto a voz.
- Cobertura multilingue limitada al magahi; no se documenta cambio de idioma ni mezcla de lenguas.

## Casos de uso

- Lectura de contenido en magahi: convertir articulos, noticias o documentacion a audio para hablantes de magahi, aprovechando que el modelo esta entrenado especificamente en esa lengua y no depende de un TTS multilingue generico.
- Accesibilidad para personas con discapacidad visual: integrar el modelo en un lector de pantalla o servicio de lectura que opere en entornos sin GPU, gracias al runtime ONNX y al tamano reducido (~0,1 GB).
- Asistentes de voz de bajo consumo: desplegar sintesis en dispositivos edge o servidores modestos mediante sherpa-onnx, sin instalar PyTorch ni CUDA.
- Preservacion linguistica y educacion: generar materiales audio en magahi para escuelas o iniciativas de documentacion de la lengua, con la ventaja de una licencia MIT en los pesos y CC-BY-4.0 en los datos, que permite redistribucion con atribucion.
- Locucion automatizada de boletines o avisos: sintetizar anuncios cortos y repetitivos (avisos meteorologicos, agricolas, administrativos) en magahi para su difusion por radio o telefonia.
- Integracion en el servidor bolo: usar la voz como parte de un pipeline de voz completo (ASR + TTS) en el mismo servidor sin PyTorch, simplificando el despliegue y el mantenimiento de dependencias.
- Pruebas de concepto de TTS para lenguas de bajos recursos: servir como referencia para comparar calidad con otros modelos VITS del proyecto SYSPIN o con TTS multilingues, dado que los pesos son los originales y la conversion es fiel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, MCD, WER de sintesis) ni comparaciones con otros sistemas; tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (~0,1 GB) el modelo cabe holgadamente en memoria de cualquier GPU consumer, pero no se publican cifras.
- GPU recomendadas: no disponibles; el modelo esta pensado para ejecucion en CPU mediante sherpa-onnx.
- Cabe en GPU consumer: si, con margen amplio dado el tamano del artefacto, aunque no se especifican requisitos minimos.
- Opciones de despliegue: sherpa-onnx (runtime principal) y el servidor bolo (`bolo pull syspin-mag-male`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bolo-syspin-magahi-male | VITS (ONNX) | mag | MIT (pesos) | ONNX | Conversion de SYSPIN; sin PyTorch |
| SYSPIN/vits_Magahi_Male | VITS (Coqui) | mag | MIT | Checkpoint Coqui | Modelo original del que deriva este |
| Otros modelos SYSPIN del proyecto | VITS | lenguas indias diversas | MIT | Coqui / ONNX | Mismo pipeline y procedencia; datos no disponibles en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a arquitectura, licencia y formato.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma (magahi) y a una unica voz masculina; no hay variantes de genero ni cambio de hablante.
- No se documentan sesgos especificos, pero al entrenarse con un corpus concreto (SYSPIN) puede reflejar las caracteristicas demograficas y dialectales de ese corpus.
- Riesgo de pronunciacion incorrecta en palabras fuera del dominio del corpus (prestamos, nombres propios, terminologia tecnica) y de artefactos prosodicos en textos largos; no hay evaluacion publicada.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento son CC-BY-4.0: cualquier uso o redistribucion debe mantener la atribucion al proyecto SYSPIN y al IISc segun los terminos indicados en la model card.
- El repositorio es una conversion de formato: no se han corregido ni mejorado los pesos originales, por lo que hereda cualquier limitacion del modelo fuente.
- Sin descargas ni likes registrados y creado en 2026, no hay evidencia de uso en produccion ni de validacion por terceros.
- No apto para tareas de comprension, razonamiento o generacion de texto: es exclusivamente un sintetizador de voz.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-magahi-male
- Modelo original: https://huggingface.co/SYSPIN/vits_Magahi_Male (revision `5a41e6164f74fff08918e5a1642ebbf50100c691`)
- Proyecto bolo: https://github.com/cb-Sigma/bolo
- Licencia de datos CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
