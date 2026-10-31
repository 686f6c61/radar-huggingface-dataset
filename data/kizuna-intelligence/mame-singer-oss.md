# kizuna-intelligence/mame-singer-oss

## Resumen

mame-singer es un modelo de sintesis de voz cantada (singing voice synthesis) desarrollado por Kizuna Intelligence, disponible en HuggingFace bajo el identificador `kizuna-intelligence/mame-singer-oss`. Su funcion principal es generar canto a partir de una partitura (楽譜) utilizando como referencia una grabacion de voz corta, lo que lo convierte en un sistema zero-shot: no requiere entrenamiento por hablante, basta con un audio breve del hablante objetivo.

El modelo se apoya en componentes de terceros bien establecidos: el vocoder NHVSing (de wavtechyukky) para convertir mel-espectrogramas en forma de onda, los modelos de F0 y duracion de consonantes PrettyPitch (tambien de wavtechyukky), y el reference encoder de OpenVoice (de MyShell.ai) para la extraccion de caracteristicas de voz. El modelo acustico y el codigo de inferencia son creacion propia de Kizuna Intelligence.

Es relevante porque combina sintesis de canto zero-shot con una licencia abierta (CC BY 4.0 para el modelo acustico, MIT para los componentes derivados) y ofrece una version ONNX que funciona directamente en el navegador, algo poco habitual en este dominio. El idioma soportado es el japones (ja). No se ha publicado informacion sobre arquitectura detallada, numero de parametros, longitud de contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo acustico + vocoder NHVSing + modelos F0/duracion PrettyPitch + reference encoder OpenVoice) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY 4.0 (modelo acustico); MIT (vocoder, F0/duracion, voice encoder, tabla de fonemas) |
| Formato de pesos | PyTorch (`.pt`) y ONNX (directorio `onnx/` para la version de navegador) |

## Arquitectura y entrenamiento

mame-singer no es un modelo unico, sino un pipeline modular de sintesis de canto. El nucleo es el modelo acustico (`acoustic.pt`), desarrollado por Kizuna Intelligence, que genera mel-espectrogramas a partir de la partitura y de la referencia de voz. La entrada musical se procesa mediante los modelos F0 (`f0.pt`) y de duracion de consonantes (`cons_dur.pt`, `cons_dur.json`) de PrettyPitch, que se encargan de leer la partitura y estimar la altura tonal y las duraciones fonemicas. La identidad vocal se extrae con el reference encoder de OpenVoice (`voice_encoder.pt`), lo que permite la clonacion de voz zero-shot a partir de una grabacion corta. Finalmente, el vocoder NHVSing (`vocoder.onnx`) convierte el mel-espectrograma en forma de onda audible.

Todo el pipeline esta disponible en formato ONNX para ejecucion en navegador, ademas de la version PyTorch original. No se ha publicado informacion sobre el numero de parametros, el corpus de entrenamiento, el numero de tokens o muestras, ni sobre tecnicas de alineacion como RLHF o DPO (conceptos no aplicables directamente a un modelo de sintesis de audio, pero tampoco se documentan alternativas como perdidas adversariales o preentrenamiento).

## Capacidades

- Sintesis de voz cantada zero-shot: genera canto a partir de una partitura usando una grabacion de voz corta como referencia, sin necesidad de ajuste por hablante.
- Extraccion de caracteristicas de voz mediante el reference encoder de OpenVoice, que transfiere el timbre del hablante de referencia al canto sintetizado.
- Estimacion de F0 (altura tonal) y duraciones de consonantes mediante los modelos de PrettyPitch, con lectura de partitura y procesamiento de duraciones fonemicas.
- Vocodizacion de mel-espectrogramas a forma de onda mediante NHVSing.
- Ejecucion en navegador gracias a la version ONNX del pipeline completo.
- Idioma de sintesis: japones (ja), con tabla de fonemas incluida (`phonemes.json`).
- No soporta tool calling, agentes ni razonamiento multi-paso: se trata de un modelo de audio, no de lenguaje.

## Casos de uso

- Creacion de canciones con voces propias: un musico o creador de contenido puede grabar unos segundos de su voz y hacer que el modelo cante una partitura compuesta por el, sin necesidad de grabar la interpretacion vocal completa.
- Prototipado vocal rapido para compositores: al aceptar partituras como entrada, permite escuchar demos de melodias con letra en japones antes de contratar a un cantante o grabar en estudio.
- Aplicaciones web interactivas: la version ONNX ejecutable en navegador permite integrar la sintesis de canto directamente en paginas web sin backend de GPU, ideal para juguetes musicales, karaokes interactivos o herramientas educativas.
- Produccion de contenido para VTubers y creadores japoneses: generacion de pistas vocales en japones con el timbre del personaje, manteniendo coherencia de identidad vocal entre producciones.
- Investigacion en sintesis de voz cantada: al ser open source y modular (vocoder, F0, encoder de voz y modelo acustico separados), permite sustituir o reentrenar componentes individuales para experimentacion academica.
- Accesibilidad y entretenimiento: herramientas que permitan a personas sin formacion vocal generar interpretaciones cantadas a partir de texto y partitura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas de calidad perceptual (MOS, MOS-Naturalness), de fidelidad de timbre (speaker similarity) ni comparaciones con otros sistemas de sintesis de canto (como NANSY, VISinger o SiFiSinger).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un pipeline con version ONNX para navegador, es probable que la inferencia CPU o WebGPU sea viable, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. La version de navegador sugiere que no se requiere GPU dedicada; para la version PyTorch, una GPU de consumo con VRAM moderada deberia bastar, aunque no hay datos oficiales.
- Cabe en consumer GPU: no disponible; el tamano del repo indicado es 0.0 GB, por lo que los pesos parecen ligeros, pero no hay especificacion de requisitos.
- Opciones de despliegue:
  - Navegador via ONNX (Space oficial de HuggingFace: `kizuna-intelligence/mame-singer-oss`).
  - Codigo de inferencia y GUI disponibles en GitHub (`kizuna-intelligence/mame-singer-oss`).
  - No hay menciones a vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Caracteristica | mame-singer | OpenVoice (base) | NHVSing |
|---|---|---|---|
| Tarea | Sintesis de canto zero-shot desde partitura | Clonacion de voz hablada zero-shot | Vocodizacion para canto (mel a waveform) |
| Entrada | Partitura + audio de referencia corto | Texto + audio de referencia | Mel-espectrograma |
| Idioma | Japones | Multilingue (principalmente ingles y chino) | Agnostico al idioma |
| Licencia | CC BY 4.0 (acustico) + MIT (componentes) | MIT | MIT |
| Formato | PyTorch y ONNX (navegador) | PyTorch | PyTorch y ONNX |

mame-singer se distingue de sus componentes de origen en que los integra en un sistema completo de canto zero-shot con entrada de partitura, algo que ni OpenVoice (orientado a voz hablada) ni NHVSing (solo vocoder) ofrecen por separado. Comparativas con otros sistemas de sintesis de canto open source (VISinger, SiFiSinger, NANSY++): no disponible, al no haber datos publicados de rendimiento.

## Limitaciones y advertencias

- Idioma limitado: el modelo solo soporta japones (ja); la tabla de fonemas incluida esta disenada para ese idioma, por lo que no es directamente utilizable con espanol, ingles u otras lenguas.
- Sin benchmarks publicados: no hay metricas de calidad perceptual ni comparaciones formales, por lo que la calidad del canto generado debe evaluarse de forma empirica antes de usarlo en produccion.
- Clonacion de voz y uso indebido: al tratarse de un sistema zero-shot de clonacion vocal, existe riesgo de suplantacion de identidad (deepfakes de voz cantada). Los responsables de despliegue deben obtener consentimiento del hablante de referencia.
- Licencia por componentes: el modelo acustico es CC BY 4.0, que exige atribucion explicita ("mame-singer (Kizuna Intelligence)" con el enlace al Space) en cualquier redistribucion, modificacion o integracion. El incumplimiento termina automaticamente la licencia (con periodo de correccion de 30 dias conforme al articulo 6 de CC BY 4.0). Los demas componentes son MIT.
- Riesgo de alucinacion: no aplicable en el sentido de LLMs, pero la sintesis puede producir artefactos, errores de pronunciacion en fonemas japoneses complejos o desviaciones tonales; no hay documentacion sobre estos fallos.
- Informacion tecnica incompleta: no se publican parametros, requisitos de hardware, latencias ni detalles del entrenamiento, lo que dificulta la planificacion de despliegue a escala.
- El repositorio muestra un tamano de 0.0 GB, lo que sugiere que los pesos pueden estar alojados externamente o via LFS; conviene verificar la descarga efectiva de los archivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kizuna-intelligence/mame-singer-oss
- Space (version de navegador): https://huggingface.co/spaces/kizuna-intelligence/mame-singer-oss
- Codigo de inferencia y GUI en GitHub: https://github.com/kizuna-intelligence/mame-singer-oss
- NHVSing (vocoder): https://github.com/wavtechyukky/NHVSing
- PrettyPitch (F0 y duracion de consonantes): https://github.com/wavtechyukky/PrettyPitch
- OpenVoice (reference encoder): https://github.com/myshell-ai/OpenVoice
- Paper o blog oficial: no disponible
