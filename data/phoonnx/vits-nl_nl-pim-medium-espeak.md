# Phoonnx/vits-nl_nl-pim-medium-espeak

## Resumen

vits-nl_nl-pim-medium-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en neerlandés (variante nl-NL) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA y produciendo una forma de onda directamente, sin etapa vocoder separada.

La relevancia de este modelo es fundamentalmente práctica: es una voz de tamano medio (repo de 0,1 GB) pensada para despliegue local y de bajos requisitos, integrable en asistentes de voz domésticos (OVOS/Mycroft) y en aplicaciones web mediante phoonnx.js. No es un modelo de propósito general ni compite en calidad con sistemas neuronales de gran escala; su valor reside en la licencia MIT, el formato ONNX portable y la integración con el ecosistema de phonemización de espeak.

La información pública disponible es escasa: la model card describe el empaquetado, la procedencia (rhasspy/piper-voices/nl/nl_NL/pim/medium) y el uso, pero no aporta detalles sobre datos de entrenamiento, número de parámetros, métricas de calidad ni benchmarks. Esta ficha refleja únicamente lo documentado y marca como no disponible todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | neerlandés (nl-NL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales; el resultado es un modelo que produce audio directamente a partir de fonemas sin vocoder externo. La model card confirma la arquitectura y la procedencia (Rhasspy, Piper), pero no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de ajuste fino o RLHF.

La innovación relevante aquí no es arquitectónica sino de empaquetado: Phoonnx exporta y distribuye los pesos en ONNX para inferencia portable, y delega la normalización de texto y la fonemización en la librería scriptconv, que usa `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`. La calidad de pronunciación depende por tanto de la coincidencia entre los fonemas de espeak-ng y los usados en el entrenamiento original; la propia model card advierte que la implementación espyak (usada cuando no está disponible espeak-ng) puede diferir en algunos fonemas y producir palabras mal pronunciadas.

## Capacidades

- Síntesis de voz a partir de texto en neerlandés (nl-NL), con salida en fichero WAV.
- Entrada basada en fonemas espeak en alfabeto IPA, no en texto crudo directo: la normalización y conversión la realiza scriptconv.
- Integración con el gestor de modelos de phoonnx (`TTSModelManager`), incluyendo carga y fusión de voces por defecto.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multilingüismo ni tool calling (no aplica a un modelo TTS).
- No se documentan modos de razonamiento, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz domésticos autoalojados: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx` y permite respuestas habladas en neerlandés sin depender de servicios en la nube, con un repo de 0,1 GB que cabe en dispositivos modestos.
- Lectura de notificaciones y alertas en sistemas domóticos: la síntesis local rápida permite convertir mensajes de texto en audio para altavoces conectados, manteniendo la privacidad al no enviar texto a terceros.
- Accesibilidad para usuarios neerlandófonos: conversión de texto de pantalla (documentos, correo, interfaces) a voz en aplicaciones de escritorio, aprovechando la licencia MIT para su inclusión en productos.
- Síntesis en el navegador: mediante phoonnx.js y su demo, se puede generar voz neerlandesa en cliente sin backend, útil para aplicaciones web educativas o de lectura.
- Pruebas y desarrollo de pipelines TTS: al ser ONNX y de tamano reducido, sirve como voz de referencia para validar la cadena scriptconv + phoonnx antes de desplegar voces mayores.
- Generación de audio para prototipos de asistentes conversacionales en neerlandés: permite iterar sobre diálogos y prompts de voz sin coste de API, aunque con calidad de voz media.
- Integración en sistemas embebidos o de bajos recursos: el formato ONNX y el tamano contenido permiten ejecución en CPU, útil para dispositivos tipo Raspberry Pi en entornos domésticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un repo de 0,1 GB, la huella de memoria es muy reducida y compatible con ejecución en CPU.
- GPU recomendadas: no se documentan; al ser un modelo ONNX de tamano medio, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna e incluso en CPU, aunque no se aportan cifras oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-nl_nl-pim-medium-espeak (este) | VITS | nl-NL | 0,1 GB (repo) | MIT | ONNX | Empaquetado Phoonnx, entrada espeak |
| Otras voces Piper nl_NL (p. ej. nl_NL-mls-medium, nl_BE) | VITS | nl-NL / nl-BE | no disponible en esta busqueda | MIT (upstream Piper) | ONNX | Mismo origen Rhasspy; no se dispone de datos comparativos de calidad |
| Voces TTS neuronales comerciales (p. ej. servicios cloud) | no disponible | múltiples | no disponible | propietaria | API | No comparables en licencia ni despliegue local |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas; la comparativa se limita a atributos de licencia, formato y despliegue.

## Limitaciones y advertencias

- Calidad de voz media: la propia denominación "medium" y el origen Piper indican una voz funcional, no de alta fidelidad; no se aportan métricas MOS.
- Dependencia de espeak-ng: sin espeak-ng instalado, phoonnx usa espyak, cuyos fonemas pueden diferir y provocar pronunciaciones incorrectas.
- Cobertura limitada a neerlandés nl-NL; no se documenta soporte de otras variantes ni cambio de idioma.
- Sin datos publicados sobre sesgos, alucinaciones (no aplica en el sentido textual, pero sí posibles errores de pronunciación) ni robustez ante texto ruidoso.
- Licencia MIT declarada por el upstream en la model card de rhasspy/piper-voices; conviene verificar los términos del proyecto Piper original antes de uso comercial a gran escala.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, con posible falta de soporte de la comunidad.
- Fecha de creación indicada como 2026-11-16, posterior a la fecha habitual de consulta; tratar con cautela cualquier metadato temporal.
- No apta para clonación de voz ni para control expresivo; su uso previsto es síntesis genérica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-pim-medium-espeak
- Upstream Piper (voz nl_NL/pim/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_NL/pim/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
