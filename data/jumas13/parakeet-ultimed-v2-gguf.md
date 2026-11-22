# JUMAS13/parakeet-ultimed-v2-gguf

## Resumen

Parakeet UltiMed v2 GGUF es una conversión al formato GGUF (cuantización Q5_K_M) del modelo de reconocimiento automático del habla (ASR) Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx, un ajuste fino orientado al dominio médico en francés. La conversión la publica el usuario JUMAS13 y está pensada para el motor transcribe.cpp, una implementación ligera de inferencia ASR que permite ejecutar el modelo localmente, incluso en dispositivos móviles. El modelo se emplea en la aplicación « Bonne tournée », una herramienta de dictado para enfermeras liberales que funciona íntegramente en el teléfono.

El modelo original deriva de la familia Parakeet de NVIDIA (nvidia/parakeet-tdt-0.6b-v3) a través de moondream/parakeet-ultra, y ha sido especializado en vocabulario médico francés mediante datos como PARHAF (HealthDataHub) y nomenclátores públicos de medicamentos franceses (OPEN_MEDIC, RETROCEDAM, base de datos pública de medicamentos). No hay reentrenamiento en esta conversión: solo se transforman los pesos de NeMo a GGUF y se cuantizan.

Con 627 millones de parámetros (~0,6 B) y un tamaño de repositorio de 0,5 GB, es un modelo compacto y desplegable en hardware modesto. Su relevancia radica en la combinación de dominio especializado (transcripción médica en francés), licencia permisiva CC BY 4.0 y formato optimizado para inferencia local en el borde (edge).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), familia NVIDIA Parakeet; conversión con perfil Parakeet TDT 0.6B v3 |
| Parámetros totales | 627.052.166 (~0,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q5_K_M (único archivo publicado: `parakeet-ultimed-v2-Q5_K_M.gguf`) |
| Idiomas soportados | francés (`fr`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (origen: NeMo / ONNX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, un modelo ASR de tipo transducer que predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva eficiente. La conversión a GGUF mantiene la misma arquitectura que el perfil Parakeet TDT 0.6B v3, sin cambios estructurales ni reentrenamiento: los pesos se transforman desde el formato NeMo original (`parakeet-tdt-0.6b-v3-ultimed.nemo`, revisión del 21/11/2026) mediante el conversor de transcribe.cpp y se cuantizan a Q5_K_M.

El ajuste fino original (UltiMed v2) especializa el modelo base en vocabulario y terminología médica francesa. Según la model card, se apoya en el corpus PARHAF (HealthDataHub / Plateforme des Données de Santé) y en nomenclátores públicos de medicamentos franceses (OPEN_MEDIC, RETROCEDAM de la CNAM / Assurance Maladie y la base de datos pública de medicamentos). También se menciona el uso de Common Voice 22.0 (Mozilla, CC0-1.0). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Las reglas de corrección de UltiMed v2 (licencia AGPL-3.0) no se incluyen en esta conversión.

## Capacidades

- Reconocimiento automático del habla (ASR) en francés, con especialización en terminología médica.
- Transcripción de dictado clínico: nombres de medicamentos, patologías y vocabulario sanitario francés.
- Ejecución local en el dispositivo (on-device), sin necesidad de conexión a servicios en la nube.
- Inferencia mediante el motor transcribe.cpp, orientado a despliegues ligeros.
- Formato GGUF cuantizado (Q5_K_M) para reducir huella de memoria y almacenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.

## Casos de uso

- Dictado clínico para enfermeras y personal sanitario: la aplicación « Bonne tournée » usa el modelo para transcribir notas de visita en el propio teléfono, lo que resulta adecuado por su tamaño compacto (0,5 GB) y su especialización en vocabulario médico francés.
- Documentación de consultas en atención primaria: transcripción local de informes dictados por médicos francófonos, preservando la confidencialidad de datos de salud al no enviar audio a la nube.
- Registro de medicación: la especialización en nomenclátores franceses de medicamentos (OPEN_MEDIC, RETROCEDAM) facilita la transcripción correcta de nombres comerciales y principios activos.
- Aplicaciones móviles de asistencia sanitaria: integración vía transcribe.cpp en apps iOS/Android para transcripción en tiempo real sin infraestructura de servidores.
- Prototipado y evaluación de ASR médico: como punto de partida para investigadores que necesiten un modelo ASR francés especializado y de licencia permisiva para experimentar.
- Sistemas de dictado en entornos con conectividad limitada o requisitos de soberanía de datos: al ejecutarse en local, evita el envío de información clínica a terceros.
- Transcripción de audios de investigación clínica en francés: útil en estudios que requieran procesar entrevistas o notas de voz de dominio sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 627 M de parámetros y cuantización Q5_K_M (≈5 bits por peso), la huella de pesos ronda los 0,4 GB, por lo que la memoria total necesaria es moderada.
- GPU recomendadas: no se especifican; por tamaño, el modelo es apto para GPU de consumo e incluso CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con ≥2 GB de VRAM; también es viable en CPU y en dispositivos móviles (el caso de uso declarado es un teléfono).
- Opciones de despliegue: transcribe.cpp (motor objetivo); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JUMAS13/parakeet-ultimed-v2-gguf | ~0,6 B | fr | GGUF (Q5_K_M) | CC BY 4.0 | Especializado en dominio médico francés; motor transcribe.cpp |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx | ~0,6 B | fr | ONNX | CC BY 4.0 | Modelo base de esta conversión; mismo ajuste fino |
| moondream/parakeet-ultra | ~0,6 B | no disponible | no disponible | CC BY 4.0 | Modelo intermedio del linaje |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | multilingüe (no disponible en detalle) | NeMo | CC BY 4.0 | Modelo original de NVIDIA, sin especialización médica |

## Limitaciones y advertencias

- Solo soporta francés (`fr`); no es adecuado para otros idiomas.
- Especializado en dominio médico: su rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos no franceses o terminología fuera del corpus de entrenamiento.
- No se incluyen las reglas de corrección de UltiMed v2 (AGPL-3.0), por lo que el post-procesado del modelo original no está disponible en esta conversión.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a los autores originales y respetar las atribuciones indicadas (Olicorne, moondream, NVIDIA, HealthDataHub, Mozilla, CNAM).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria.
- No se documentan métricas de calidad (WER) ni benchmarks, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- Al tratarse de una conversión de pesos sin reentrenamiento, cualquier limitación del modelo original se hereda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JUMAS13/parakeet-ultimed-v2-gguf
- Modelo base (ONNX): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-v2-onnx
- Modelo intermedio: https://huggingface.co/moondream/parakeet-ultra
- Modelo original NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Dataset PARHAF: https://huggingface.co/datasets/HealthDataHub/PARHAF
- Licencia Ouverte / Etalab 2.0: https://www.etalab.gouv.fr/licence-ouverte-open-licence/
