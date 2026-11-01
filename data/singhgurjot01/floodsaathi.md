# SinghGurjot01/FloodSaathi

## Resumen

FloodSaathi es un modelo de lenguaje de pequeno tamano (SLM) especializado en seguridad ante inundaciones y alerta temprana de desastres, desarrollado por SinghGurjot01. Se trata de un fine-tuning mediante adaptadores LoRA sobre `Qwen/Qwen2.5-0.5B-Instruct`, orientado a ofrecer protocolos concisos y verificados en materia de purificacion de agua potable, riesgos electricos, cruce de carreteras, primeros auxilios ante mordeduras de serpiente, preparacion para evacuaciones y seguridad del ganado.

El modelo esta disenado bajo un enfoque "offline-first", pensado para funcionar en dispositivos moviles, equipos de borde de baja potencia o portatiles sin conexion, un escenario critico en zonas rurales de India (piloto en Punjab) donde la conectividad puede fallar durante una emergencia. Su relevancia actual radica en la combinacion de un tamano reducido (494M parametros base) con un entrenamiento especifico en protocolos de seguridad verificados por NDMA, Punjab SDMA y CWC.

Soporta tres idiomas: ingles, hindi y punyabi, cubriendo asi las necesidades linguisticas de la region objetivo. La licencia Apache 2.0 facilita su adopcion tanto en entornos humanitarios como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA (rango 16, alpha 32) |
| Parametros totales | 494M base + 18,4M parametros entrenables del adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, hindi, punyabi |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (~35 MB para el adaptador) |

## Arquitectura y entrenamiento

FloodSaathi se construye sobre la arquitectura Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494M parametros. El ajuste se realiza mediante LoRA con rango 16 y alpha 32, anadiendo 18,4M parametros entrenables que se distribuyen en forma de adaptadores de aproximadamente 35 MB en formato safetensors. Esta eleccion permite conservar el modelo base intacto y desplegar unicamente el adaptador, reduciendo drasticamente los requisitos de almacenamiento y memoria.

El entrenamiento se centra en la incorporacion de protocolos de seguridad verificados procedentes de NDMA (National Disaster Management Authority), Punjab SDMA y CWC (Central Water Commission). La model card declara invariantes de seguridad explicitas: citacion de lineas de emergencia (112, 1078, 1070, 1077) sin alucinacion y ausencia de garantias falsas de seguridad. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, hindi y punyabi.
- Proporciona protocolos de seguridad ante inundaciones: purificacion de agua potable, riesgos de cables electricos, cruce de carreteras inundadas, primeros auxilios ante mordeduras de serpiente, preparacion para evacuacion y seguridad del ganado.
- Citacion fiable de lineas de emergencia (112, 1078, 1070, 1077) segun la model card.
- Disenado para funcionar sin conexion en dispositivos de borde y moviles.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistencia en alerta temprana de inundaciones en zonas rurales: el modelo puede desplegarse en un movil o dispositivo de borde para ofrecer instrucciones de evacuacion y protocolos de seguridad sin necesidad de conectividad, algo critico cuando la infraestructura de red se ve afectada por el propio desastre.
- Purificacion de agua potable en emergencias: responde a consultas sobre metodos de potabilizacion (hervido, cloracion, filtrado) citando protocolos NDMA, adecuado para personal de primera respuesta y comunidades afectadas.
- Prevencion de riesgos electricos durante inundaciones: informa sobre el peligro de cables caidos y pautas de seguridad, con respuestas concisas adaptadas a un contexto de baja alfabetizacion tecnica.
- Primeros auxilios ante mordeduras de serpiente: ofrece protocolos de actuacion inmediata en un formato accesible, relevante en zonas rurales de Punjab donde este riesgo se incrementa durante las inundaciones.
- Preparacion de evacuaciones y seguridad del ganado: guia a familias y agricultores sobre que hacer con animales y pertenencias antes de una evacuacion, en los tres idiomas soportados.
- Soporte multilingue para trabajadores humanitarios: permite a organizaciones de ayuda consultar protocolos en hindi o punyabi sin depender de traduccion en linea, facilitando la comunicacion con comunidades locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 494M parametros, cabe en menos de 2 GB en precision fp16 y por debajo de 1 GB con cuantizacion de 4 bits (estimacion orientativa; no confirmada en la model card).
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU, dispositivos moviles y equipos de borde de baja potencia.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: no se documentan explicitamente; al estar basado en Qwen2.5 y usar safetensors, es compatible con frameworks estandar como transformers, llama.cpp u Ollama previa conversion (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| FloodSaathi | 494M + 18,4M (LoRA) | No disponible | en, hi, pa | Apache 2.0 | Seguridad ante inundaciones |
| Qwen2.5-0.5B-Instruct | 494M | No disponible en la informacion | Multilingue | Apache 2.0 | Proposito general |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en la informacion | Multilingue | Apache 2.0 | Proposito general |

La comparativa se limita al modelo base y a la variante superior de la misma familia, ya que no se dispone de datos de benchmarks ni de otros modelos especializados en respuesta ante desastres en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de muy pequeno tamano (494M parametros): capacidad de razonamiento y conocimiento general limitados en comparacion con modelos de mayor escala.
- Riesgo de alucinacion inherente a los SLM; aunque la model card declara invariantes de seguridad, no se aportan evaluaciones independientes que las verifiquen.
- Cobertura linguistica limitada a ingles, hindi y punyabi; no se documenta soporte de otras lenguas de India.
- Longitud de contexto no especificada, lo que dificulta planificar conversaciones multi-turno extensas.
- El modelo esta calibrado para el contexto normativo de India (NDMA, Punjab SDMA, CWC); su uso fuera de ese marco geografico puede producir recomendaciones inadecuadas.
- No debe sustituir la orientacion de servicios de emergencia reales; su uso en produccion requiere validacion por expertos en gestion de desastres.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan clausulas adicionales de responsabilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/SinghGurjot01/FloodSaathi
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
