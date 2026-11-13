# danielrosehill/Whisper-Hebrish

## Resumen

Whisper-Hebrish es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla openai/whisper-large-v3-turbo, desarrollado por el usuario danielrosehill y publicado en Hugging Face. Su proposito es manejar el fenomeno del code-switching entre hebreo e ingles, es decir, transcripciones en las que un hablante alterna entre ambos idiomas dentro de una misma frase o conversacion, algo frecuente en comunidades bilingues y en contextos profesionales y tecnologicos donde el ingles se mezcla con el hebreo.

El modelo parte de la arquitectura encoder-decoder de Whisper en su variante turbo, con 808.878.080 parametros y un enfoque de inferencia optimizado respecto a whisper-large-v3 completo. El ajuste se realizo sobre el dataset propio danielrosehill/Read-Aloud-Voice-Sentences, y el repositorio incluye pesos en formato safetensors. La licencia es MIT, aunque el acceso al repositorio esta restringido y requiere aceptar condiciones en Hugging Face.

Es relevante porque los modelos Whisper originales estan entrenados predominantemente con datos monolingues y suelen degradarse cuando el audio mezcla idiomas; un fine-tune especifico para code-switching hebreo-ingles cubre un nicho poco atendido. No obstante, se trata de un modelo con muy poca traccion (40 descargas, 0 likes) y sin benchmarks publicados, por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, herencia de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (etiqueta oficial); el objetivo declarado es code-switching hebreo-ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-large-v3-turbo: un transformer encoder-decoder con atencion estandar, disenado para procesar espectrogramas mel de audio en ventanas de 30 segundos y generar transcripciones autoregresivas. La variante turbo reduce el numero de capas del decoder respecto a large-v3, lo que disminuye la latencia de inferencia a costa de una ligera perdida de precision en tareas genericas. El recuento de 808.878.080 parametros es coherente con esta variante.

El ajuste fino se realizo sobre el dataset danielrosehill/Read-Aloud-Voice-Sentences, orientado a frases leidas en voz alta con mezcla de hebreo e ingles. No se dispone de informacion sobre el numero de tokens de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aumento de datos. Tampoco hay datos publicados sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias de Whisper turbo.

## Capacidades

- Transcripcion de voz a texto (ASR) en audio con code-switching hebreo-ingles.
- Reconocimiento de habla en ingles (idioma oficial declarado en la model card).
- Manejo de audio de hasta 30 segundos por ventana, con posibilidad de segmentacion para audios largos.
- Generacion de transcripciones con puntuacion y mayusculas heredadas del modelo base.
- Capacidad multilingue limitada al par hebreo-ingles segun el objetivo del fine-tune; no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo thinking, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones bilingues hebreo-ingles: el modelo puede procesar grabaciones donde los participantes alternan idiomas, algo comun en empresas tecnologicas israelies con equipos internacionales.
- Subtitulado de contenido audiovisual: util para podcasts, webinars y videos de YouTube dirigidos a audiencias bilingues, donde Whisper estandar suele fallar al cambiar de idioma a mitad de frase.
- Atencion al cliente en centros de soporte: transcripcion de llamadas donde el agente habla hebreo y el cliente introduce terminos tecnicos en ingles, mejorando la calidad del registro para analitica posterior.
- Documentacion clinica o legal: dictado de notas donde el profesional mezcla terminologia en ingles (farmacos, procedimientos) con hebreo coloquial, reduciendo errores de transcripcion.
- Investigacion sociolinguistica: analisis de corpus de habla espontanea con code-switching, donde la precision en los cambios de idioma es critica para el estudio.
- Accesibilidad: generacion de subtitulos automaticos para personas con discapacidad auditiva en entornos bilingues, con la advertencia de que requiere validacion humana por la falta de benchmarks.
- Integracion en pipelines de transcripcion masiva: al estar en safetensors y ser compatible con la familia Whisper, puede desplegarse con frameworks estandar como faster-whisper o Transformers, aunque el acceso gated complica la automatizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,6 GB para los pesos (808 M parametros) mas overhead de activaciones y cache, en torno a 3-4 GB en total.
- VRAM estimada en cuantizacion INT8: aproximadamente 1-1,5 GB, aunque no se documentan cuantizaciones oficiales para este fine-tune.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) puede ejecutar el modelo con holgura; tambien A100 y H100 para despliegues de alto throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: Transformers (pipeline automatic-speech-recognition), faster-whisper, whisper.cpp (previa conversion a GGML/GGUF), vLLM no aplica directamente a ASR, TGI no soporta Whisper de forma nativa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la variante turbo del modelo base suele ofrecer una mejora de velocidad significativa frente a large-v3, pero no hay mediciones especificas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Whisper-Hebrish | 808.878.080 | 30 s por segmento | en (objetivo hebreo-ingles) | MIT | Gated |
| openai/whisper-large-v3-turbo | ~809 M | 30 s por segmento | multilingue (99 idiomas) | MIT | Abierto |
| openai/whisper-large-v3 | ~1,55 B | 30 s por segmento | multilingue (99 idiomas) | MIT | Abierto |
| ivrit-ai/whisper-large-v3-turbo | ~809 M | 30 s por segmento | hebreo | MIT/Apache (segun variante) | Abierto |

La comparativa se basa en caracteristicas publicas de los modelos base y alternativas conocidas de la comunidad hebrea; no hay datos de rendimiento comparativo disponibles para Whisper-Hebrish.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en code-switching.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica el uso en pipelines automatizados y en entornos de CI/CD.
- Dataset de entrenamiento pequeno y no documentado en detalle (Read-Aloud-Voice-Sentences), lo que sugiere posible sobreajuste a frases leidas y peor rendimiento en habla espontanea.
- La etiqueta oficial de idioma es solo "en", pese al objetivo hebreo-ingles; esto puede afectar a la seleccion de token de idioma en la inferencia.
- Riesgo de alucinacion inherente a Whisper, especialmente en segmentos con silencio, ruido o cambios bruscos de idioma.
- Sesgos desconocidos: no se documenta la demografia de los hablantes del dataset, por lo que puede haber sesgos de acento, genero o edad.
- Licencia MIT permisiva para uso comercial, pero el acceso gated puede imponer terminos adicionales que deben revisarse.
- Modelo con muy baja adopcion (40 descargas, 0 likes) y sin mantenimiento comunitario verificable; la fecha de actualizacion (2026-11-12) es posterior a la de creacion, pero no hay changelog.
- No apto para produccion sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/danielrosehill/Whisper-Hebrish
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de entrenamiento: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- DOI: https://doi.org/10.57967/hf/7019
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
