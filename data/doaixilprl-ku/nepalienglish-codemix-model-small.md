# DOAIxILPRL-KU/nepalienglish-codemix-model-small

## Resumen

El modelo `nepalienglish-codemix-model-small` es un ajuste fino de `openai/whisper-small` desarrollado por el equipo DOAI x ILPRL-KU, orientado especificamente al reconocimiento automatico del habla (ASR) en escenarios de cambio de codigo intraoracional entre nepalí e inglés. Resuelve un problema concreto: los sistemas ASR multilingues convencionales rinden mal cuando un hablante alterna entre dos idiomas dentro de la misma frase, algo comun en comunidades bilingues nepalíes donde el inglés aparece como prestamo linguistico o frase insertada.

Arquitectura encoder-decoder Transformer propia de la familia Whisper Small, con 241.734.912 parametros totales y pesos en formato SafeTensors (aproximadamente 922 MB, repo de 1.0 GB). El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integracion en productos.

Es relevante ahora porque el ASR code-mixed para lenguas de bajos recursos sigue siendo un nicho poco cubierto por los modelos generalistas, y este checkpoint ofrece una alternativa ligera (small) y abierta frente a soluciones propietarias o modelos mucho mas grandes. El modelo esta pensado para dominio conversacional y de redes sociales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder Transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne), inglés (en), con cambio de codigo intraoracional |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `openai/whisper-small`, que emplea una arquitectura encoder-decoder Transformer con entrada de espectrograma log-Mel y decodificacion autoregresiva. El ajuste se realizo sobre el mejor checkpoint de validacion (`best_checkpoint`) segun la model card, orientado a dominio conversacional y de redes sociales con habla code-switched nepalí-inglés.

No se especifican en la informacion disponible el numero de tokens de audio de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF/DPO o decodificacion especulativa. Tampoco se detalla la estrategia de tokenizacion para el cambio de codigo ni el tratamiento del vocabulario compartido entre ambos idiomas.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en audio de 16 kHz mono.
- Transcripcion de habla con cambio de codigo intraoracional nepalí-inglés, incluyendo prestamos y frases insertadas.
- Salida en texto con mezcla de Devanagari y caracteres latinos segun el contenido.
- Soporte de seleccion de idioma en la generacion (`language="ne"` en el ejemplo de la model card).
- Uso con la libreria `transformers` (WhisperProcessor y WhisperForConditionalGeneration).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de conversaciones bilingues nepalí-inglés: el modelo esta entrenado para frases donde el hablante alterna idiomas, por lo que puede transcribir reuniones o llamadas de comunidades nepalíes en el extranjero sin segmentar manualmente por idioma.
- Subtitulado de contenido en redes sociales: util para videos y podcasts donde los creadores nepalíes mezclan inglés y nepalí de forma natural, generando subtitulos en un unico pase.
- Atencion al cliente en centros de contacto: permite transcribir llamadas de soporte donde el agente o el cliente alternan idiomas, facilitando el analisis posterior y el cumplimiento de calidad.
- Documentacion clinica o legal dictada: transcripcion de notas donde el profesional usa terminologia inglesa dentro de una frase en nepalí, reduciendo errores frente a modelos monoidioma.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos de habla code-switched para estudiar patrones de cambio de codigo y prestamos lexicos.
- Accesibilidad y actas automaticas: transcripcion de clases, seminarios o asambleas comunitarias con hablantes bilingues, con coste de inferencia bajo gracias al tamano small.
- Prototipado rapido en pipelines ASR: al ser un modelo de 241 M de parametros y licencia MIT, sirve como base para experimentar con ajustes adicionales o para desplegar en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB de pesos mas overhead de activaciones; en la practica cabe en GPUs consumer con 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Tambien puede ejecutarse en CPU para audio corto.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna consumer.
- Opciones de despliegue: `transformers` (referencia en la model card), y por compatibilidad con Whisper Small cabria esperar soporte en `whisper.cpp`, `faster-whisper`, `vLLM` (si soporta la arquitectura) y `Ollama` mediante conversion, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nepalienglish-codemix-model-small | 241,7 M | ne, en (code-mixed) | ventanas de 30 s (Whisper) | MIT | Hugging Face |
| openai/whisper-small | 244 M | multilingue (99 idiomas) | ventanas de 30 s | MIT | Hugging Face |
| openai/whisper-base | 74 M | multilingue | ventanas de 30 s | MIT | Hugging Face |
| openai/whisper-medium | 769 M | multilingue | ventanas de 30 s | MIT | Hugging Face |

La ventaja del modelo ajustado es su especializacion en cambio de codigo nepalí-inglés frente a Whisper Small generico, a igualdad de tamano y licencia. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado metricas (WER, CER) ni evaluaciones comparativas; el rendimiento real es desconocido.
- El modelo esta especializado en nepalí-inglés code-mixed; su rendimiento en habla monolingue o en otros pares de idiomas puede degradarse respecto al Whisper Small original.
- Riesgo de alucinacion en audio ruidoso o con habla solapada, comun en modelos Whisper.
- Sesgos potenciales derivados del dataset de ajuste, no documentado: posible infrarepresentacion de acentos, generos o registros.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre exactitud ni idoneidad para dominios criticos.
- No se documentan limitaciones de contexto mas alla de la ventana estandar de 30 s de Whisper.
- Modelo con 0 descargas y 1 like en el momento de la ficha: ecosistema y validacion externa muy limitados.
- No se especifican requisitos de normalizacion de audio mas alla de 16 kHz mono.

## Enlaces

- Hugging Face: https://huggingface.co/DOAIxILPRL-KU/nepalienglish-codemix-model-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (referencia del base model): https://arxiv.org/abs/2212.04356
