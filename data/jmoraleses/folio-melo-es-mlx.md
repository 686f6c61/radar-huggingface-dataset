# jmoraleses/folio-melo-es-mlx

## Resumen

Folio Melo ES MLX es un checkpoint de inferencia de texto a voz (TTS) basado en la arquitectura VITS2 del sistema MeloTTS, convertido a Safetensors para su uso con MLX en Apple Silicon. Lo publica el desarrollador jmoraleses como parte del proyecto Folio iOS, una aplicacion que ejecuta inferencia de forma nativa en Swift sobre el framework MLX de Apple. No se trata de un modelo original, sino de una conversion del checkpoint oficial `myshell-ai/MeloTTS-Spanish` a un formato y una implementacion compatibles con el ecosistema MLX.

El modelo resuelve la sintesis de voz en castellano en local, sin depender de servicios en la nube, con un peso de 41.576.193 parametros (unos 0,2 GB en el repositorio). Esto lo hace especialmente atractivo para aplicaciones moviles y de escritorio en macOS/iOS donde la privacidad y la latencia baja son prioritarias. La licencia MIT del MeloTTS original se mantiene en esta conversion.

Es relevante ahora porque el ecosistema MLX esta creciendo rapidamente como alternativa a PyTorch en hardware Apple, y las conversiones de modelos TTS pequenos y eficientes como este permiten integrar sintesis de voz de calidad en apps nativas sin infraestructura externa. La contrapartida es que se trata de un artefacto muy especifico: la inferencia no esta incluida en el repositorio y depende de la implementacion Swift/MLX de la app Folio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS2 (MeloTTS), TTS end-to-end |
| Parametros totales | 41.576.193 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Espanol (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS2, un sistema de sintesis de voz end-to-end que combina un codificador de texto, un predictor de duracion, un flujo normalizador y un decodificador generativo basado en GAN (HiFi-GAN). La conversion a MLX excluye los artefactos exclusivos de entrenamiento (discriminador, cuantizador y componentes del predictor de duracion no necesarios para inferencia), por lo que el checkpoint resultante contiene unicamente los pesos necesarios para generar audio a partir de texto.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus en castellano ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. El checkpoint original procede de `myshell-ai/MeloTTS-Spanish` en la revision `dbb5496df39d11a66c1d5f5a9ca357c3c9fb95fb`. La innovacion principal de esta publicacion no es arquitectonica, sino de despliegue: la conversion a Safetensors y la implementacion de inferencia en Swift/MLX para ejecucion on-device en Apple Silicon.

## Capacidades

- Sintesis de voz (texto a audio) en castellano.
- Generacion de audio de forma local y on-device en Apple Silicon mediante MLX.
- Inferencia nativa en Swift a traves de la app Folio iOS.
- Modelo ligero (41,6 M de parametros) adecuado para dispositivos con recursos limitados.
- No soporta tool calling ni function calling (es un modelo TTS, no un LLM).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al espanol en este checkpoint.
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Lectura de articulos y noticias en voz alta dentro de una app iOS: el modelo sintetiza texto en castellano localmente, sin enviar contenido a servidores externos, lo que preserva la privacidad del usuario.
- Accesibilidad para personas con discapacidad visual: integrado en una app de lectura, permite convertir documentos y pantallas en audio con latencia baja al ejecutarse en el propio dispositivo.
- Asistentes de voz embebidos: al ser un modelo pequeno y on-device, puede alimentar respuestas habladas en asistentes personales sin conexion a internet.
- Audiolibros y contenido narrado: permite generar narraciones en castellano de forma automatizada para publicacion o consumo personal, con coste marginal nulo tras el despliegue.
- Aprendizaje de idiomas: la sintesis de pronunciacion en castellano ayuda a aplicaciones educativas a generar ejemplos auditivos bajo demanda.
- Prototipado de interfaces conversacionales: desarrolladores que trabajan con MLX pueden integrar rapidamente TTS en demos y pruebas de concepto en macOS/iOS sin depender de APIs de terceros.
- Sistemas de navegacion o avisos por voz en apps moviles: la inferencia local elimina la dependencia de red y reduce la latencia en la reproduccion de indicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 0,2 GB en safetensors; la memoria necesaria para inferencia es del orden de unos cientos de MB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: hardware Apple Silicon (serie M1, M2, M3, M4) con soporte MLX; el modelo esta disenado para ejecucion on-device, no para GPUs NVIDIA.
- Cabe en hardware consumer: si, en cualquier Mac o dispositivo Apple con chip de la serie M; tambien podria ejecutarse en iPhone/iPad recientes mediante la app Folio.
- Opciones de despliegue: MLX con la implementacion Swift de Folio iOS; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Folio Melo ES MLX | 41,6 M | no aplica | Espanol | MIT | HuggingFace (MLX) |
| MeloTTS-Spanish (original) | no disponible | no aplica | Espanol | MIT | HuggingFace (PyTorch) |
| Piper TTS | no disponible | no aplica | Multiples | MIT/GPL segun voz | GitHub / HuggingFace |
| Coqui TTS (XTTS) | no disponible | no aplica | Multiples | MPL-2.0 / Coqui CPML | GitHub |

La comparacion con Piper y Coqui es orientativa: ambos son sistemas TTS open source con soporte de espanol, pero sus tamanos, licencias y formatos de despliegue difieren. No se dispone de datos de rendimiento comparativo para establecer una evaluacion cuantitativa.

## Limitaciones y advertencias

- Es un artefacto de conversion, no un modelo oficial de MyShell; la calidad y el mantenimiento dependen del autor de la conversion.
- La inferencia no esta incluida en el repositorio: requiere la implementacion Swift/MLX de la app Folio iOS, lo que limita su uso fuera de ese ecosistema.
- Solo soporta espanol en este checkpoint; no hay capacidades multilingues.
- No se dispone de informacion sobre sesgos, calidad de la voz, robustez ante texto ruidoso o dominios especializados.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si puede producir pronunciaciones incorrectas o artefactos de audio ante texto fuera de dominio.
- La licencia MIT del MeloTTS original se mantiene, pero conviene verificar los terminos de los checkpoints fuente y de cualquier dependencia (por ejemplo, el BERT auxiliar para otros idiomas) antes de un uso comercial.
- No apto para tareas de razonamiento, codigo, vision ni agentes: es exclusivamente un modelo TTS.
- Al ser un modelo pequeno (41,6 M), la calidad de sintesis puede ser inferior a la de sistemas TTS de mayor tamano o basados en difusion.

## Enlaces

- HuggingFace: https://huggingface.co/jmoraleses/folio-melo-es-mlx
- Repositorio Folio iOS: https://github.com/jmoraleses/Folio-iOS
- Checkpoint fuente MeloTTS-Spanish: https://huggingface.co/myshell-ai/MeloTTS-Spanish
- Repositorio MeloTTS: https://github.com/myshell-ai/MeloTTS
- BERT frances auxiliar (referenciado en la model card): https://huggingface.co/dbmdz/bert-base-french-europeana-cased
