# SavioAonz/medscribe-models

## Resumen

Medscribe models es un repositorio de modelos de reconocimiento de voz (ASR) que alimenta a **Medscribe**, una aplicación de escritorio de dictado médico offline para radiología e informes clínicos, desarrollada por Aonz (Windows, macOS y Linux). El repositorio no contiene un modelo nuevo, sino copias sin modificar de dos modelos convertidos a formato GGUF: **MedASR** de Google, un modelo ASR especializado en vocabulario médico y radiológico, y **Parakeet Unified English 0.6B** de NVIDIA, un modelo ASR de inglés general con soporte de streaming.

La relevancia del proyecto radica en su enfoque totalmente local: el dictado médico se ejecuta sin conexión en el escritorio del usuario, lo que resuelve problemas de privacidad de datos de pacientes y de latencia. MedASR utiliza decodificación CTC prefix beam search con fusión superficial (shallow fusion) de un modelo de lenguaje KenLM de 6-gramos, la misma configuración que describe Google para el modelo original. Los archivos se ejecutan mediante la librería transcribe.cpp.

El modelo base MedASR tiene 105.316.112 parámetros (unos 105 M), mientras que Parakeet Unified es un modelo de 0,6 B de parámetros. El repositorio pesa 2,2 GB en total y ofrece cuantizaciones de 8 bits, 16 bits y precisión completa para MedASR, y 8 bits para Parakeet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR basado en CTC (MedASR); arquitectura detallada no disponible en la ficha |
| Parametros totales | 105.316.112 (MedASR, en safetensors); 0,6 B (Parakeet Unified) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, F16, F32 (MedASR); Q8_0 (Parakeet) |
| Idiomas soportados | Ingles (en) |
| Licencia | HAI-DEF (Health AI Developer Foundations) para MedASR y KenLM; CC BY 4.0 para Parakeet |
| Formato de pesos | GGUF (para transcribe.cpp); base en safetensors |

## Arquitectura y entrenamiento

MedASR es un modelo de reconocimiento de voz de Google derivado de la familia Parakeet (el repositorio lista `nvidia/parakeet-unified-en-0.6b` como base), con unos 105 millones de parametros, especializado en el dominio medico. Utiliza decodificacion CTC (Connectionist Temporal Classification). El componente diferencial del despliegue de Medscribe es el decodificador: CTC prefix beam search con fusión superficial (shallow fusion) de un modelo de lenguaje KenLM de 6-gramos (`lm_6.kenlm`, 672 MB), con beam 8, alpha 0,5 y beta 1,5, la misma configuración que documenta Google para MedASR. Sin el KenLM, el modelo recurre a decodificación greedy, con menor precision en terminologia medica.

No se dispone de informacion sobre el numero de tokens u horas de audio de entrenamiento, la composicion del dataset ni el uso de tecnicas de ajuste fino especificas mas alla de lo indicado en las fichas de los modelos base (google/medasr y nvidia/parakeet-unified-en-0.6b). Las conversiones GGUF son reempaquetados de pesos sin reentrenamiento.

## Capacidades

- Transcripcion de voz a texto en ingles, con especializacion en terminologia medica y radiologica (MedASR).
- Transcripcion de ingles general con soporte de streaming (Parakeet Unified English 0.6B).
- Ejecucion totalmente offline en escritorio (Windows, macOS, Linux) mediante transcribe.cpp.
- Decodificacion por beam search con modelo de lenguaje KenLM de 6-gramos para mejorar la precision en jerga clinica.
- Descarga automatica de archivos desde el repositorio en el primer uso de la aplicacion Medscribe.
- No es un modelo de texto generativo: no tiene capacidades de razonamiento, codigo, tool calling ni agentes.

## Casos de uso

- **Dictado de informes radiologicos**: un radiologo dicta hallazgos en su estacion de trabajo y MedASR transcribe la terminologia anatomica y patologica con mayor precision que un ASR generalista, gracias al modelo de lenguaje KenLM del dominio medico.
- **Entornos con restricciones de privacidad**: al funcionar offline, el audio de pacientes nunca sale del equipo, lo que facilita el cumplimiento de politicas internas de proteccion de datos en hospitales.
- **Documentacion clinica en consultas con conectividad limitada**: la aplicacion de escritorio no requiere conexion a servicios en la nube, util en centros con red restringida.
- **Transcripcion general en ingles**: Parakeet Unified 0.6B cubre dictados no medicos (correos, notas, correspondencia) dentro de la misma aplicacion.
- **Integracion en pipelines de ASR locales**: los archivos GGUF pueden ejecutarse directamente con transcribe.cpp en sistemas propios, sin depender de la aplicacion Medscribe.
- **Evaluacion y comparacion de ASR medicos**: los investigadores pueden usar los pesos cuantizados para comparar MedASR frente a otros ASR en corpus de voz clinica en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- MedASR Q8_0 ocupa 122 MB y F16 202 MB: ejecutable en CPU de escritorio convencional, sin GPU dedicada.
- Parakeet Unified 0.6B en Q8_0 ocupa 697 MB: ejecutable igualmente en CPU de escritorio, con mayor consumo de memoria y computo que MedASR.
- Requisitos de VRAM: no disponibles (el despliegue objetivo es offline en escritorio, presumiblemente CPU, aunque transcribe.cpp puede aprovechar aceleracion si esta disponible).
- GPU recomendadas: no disponible.
- Despliegue: transcribe.cpp (libreria indicada en el repositorio). No se menciona soporte de llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles; Parakeet Unified esta orientado a streaming, MedASR a dictado por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| MedASR (Google) | 105 M | Ingles | Medico/radiologia | HAI-DEF | safetensors, GGUF |
| Parakeet Unified 0.6B (NVIDIA) | 0,6 B | Ingles | General, streaming | CC BY 4.0 | GGUF (conversion) |
| Whisper (OpenAI) | No disponible en esta ficha | Multilingue | General | No disponible en esta ficha | No disponible en esta ficha |

MedASR se posiciona como alternativa ligera y especializada frente a ASR generalistas como Whisper: con solo 105 M de parametros y 122 MB cuantizado, es adecuado para dictado medico local, mientras que los modelos generalistas ofrecen mayor cobertura multilingue pero menor precision esperable en terminologia clinica sin ajuste fino.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte para castellano ni otros idiomas.
- La licencia HAI-DEF de MedASR incluye restricciones de uso y no esta pensada para uso clinico sin validacion apropiada y, en su caso, autorizacion regulatoria. Revisar los terminos antes de cualquier despliegue sanitario.
- Sin el modelo de lenguaje KenLM, MedASR usa decodificacion greedy, con menor precision en terminologia medica.
- Riesgo de errores de transcripcion en terminologia muy especializada o acentos no representados en el entrenamiento; no se publican metricas de WER en la ficha.
- Las conversiones GGUF son reempaquetados a 8 bits sin reentrenamiento; la cuantizacion puede introducir una ligera degradacion respecto a la precision original.
- El repositorio tiene muy poca traccion (40 descargas, 2 likes), por lo que el soporte comunitario es minimo.
- El nombre y el logotipo de Medscribe pertenecen a Aonz y no estan cubiertos por las licencias de los modelos.

## Enlaces

- Repositorio: https://huggingface.co/SavioAonz/medscribe-models
- Modelo base MedASR: https://huggingface.co/google/medasr
- Modelo base Parakeet: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Conversion MedASR GGUF: https://huggingface.co/handy-computer/medasr-gguf
- Conversion Parakeet GGUF: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Terminos de licencia HAI-DEF: https://developers.google.com/health-ai-developer-foundations/terms
- Web de Aonz: https://aonz.in
