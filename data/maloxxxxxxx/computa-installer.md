# maloxxxxxxx/computa-installer

## Resumen

COMPUTA installer no es un modelo de IA en sentido estricto, sino el repositorio de distribucion de una aplicacion de escritorio llamada COMPUTA, un asistente de IA local desarrollado por un autor identificado como Malo. El repositorio aloja los instaladores para Windows y macOS, con un tamano total de 2,3 GB, y esta etiquetado en Hugging Face como `desktop-app` bajo licencia MIT.

La aplicacion integra un stack de inferencia completamente local: Ollama como runtime, el modelo `llama3.2:3b` para generacion de texto, Whisper tiny para transcripcion de voz y una voz neuronal Piper para sintesis de habla. La propuesta de valor es la privacidad: no requiere cuentas, claves de API, telemetria ni suscripciones, y todo el procesamiento ocurre en la maquina del usuario.

Es relevante como ejemplo de empaquetado de herramientas open source en un producto de escritorio orientado a privacidad, pero conviene subrayar que el repositorio no contiene pesos de modelo propios ni una model card tecnica. La informacion disponible sobre arquitectura, entrenamiento o rendimiento del modelo subyacente (llama3.2:3b) corresponde a Meta, no a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repo distribuye una aplicacion de escritorio; el modelo subyacente es llama3.2:3b de Meta) |
| Parametros totales | no disponible (llama3.2:3b: 3,2 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (gestionados por Ollama en tiempo de instalacion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (instaladores `.exe` y `.command`; los pesos se descargan via Ollama) |

## Arquitectura y entrenamiento

El repositorio no documenta ninguna arquitectura de modelo propia. Lo que contiene son artefactos de instalacion: `COMPUTA Setup 0.1.0.exe` para Windows y `COMPUTA-Mac-Setup.command` para macOS, que configuran un entorno local con Ollama y descargan `llama3.2:3b`, Whisper tiny y una voz Piper. No hay informacion sobre datos de entrenamiento, tokens procesados, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia, porque el autor no entrena un modelo nuevo: orquesta modelos existentes.

La innovacion, si puede llamarse asi, es de producto: empaquetar un pipeline multimodal (texto, voz a texto, texto a voz) en un instalador de escritorio sin dependencias de nube. La version publicada es 0.1.0 y el repositorio se actualizo por ultima vez el 18 de noviembre de 2026.

## Capacidades

- Generacion de texto conversacional mediante `llama3.2:3b` a traves de Ollama.
- Transcripcion de voz a texto con Whisper tiny (entrada por microfono).
- Sintesis de voz con una voz neuronal Piper (salida hablada).
- Funcionamiento completamente offline una vez instalados los componentes.
- Sin cuentas, claves de API, telemetria ni suscripciones.
- Soporte de tool calling, agentes o modo thinking: no disponible (no documentado).
- Capacidades multilingues: no disponible (dependen de llama3.2:3b y Whisper tiny, no especificadas en el repo).

## Casos de uso

- Asistente personal de escritorio con privacidad estricta: usuarios que necesitan consultas conversacionales sin enviar datos a la nube, aprovechando que todo el pipeline (texto y voz) corre en local.
- Dictado y transcripcion de notas de voz: Whisper tiny convierte audio del microfono en texto que el modelo procesa, util para profesionales que trabajan con material confidencial.
- Accesibilidad por voz: la combinacion de Whisper y Piper permite interaccion manos libres para personas con movilidad reducida, con respuestas habladas.
- Entornos con conectividad limitada o air-gapped: al no requerir API keys ni conexion permanente, puede desplegarse en equipos aislados.
- Prototipado de asistentes de voz locales: desarrolladores que quieran evaluar un stack Ollama + Whisper + Piper integrado antes de construir su propio producto.
- Demostracion de empaquetado de IA local: referencia para equipos que disenan distribuciones de escritorio de modelos open source con licencia permisiva (MIT).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en el repositorio. Como referencia externa, `llama3.2:3b` cuantizado en 4 bits ocupa del orden de 2 GB, Whisper tiny menos de 1 GB y Piper es ligero; el instalador completo pesa 2,3 GB.
- GPU recomendadas: no especificadas. El stack esta pensado para ejecucion en CPU o GPU consumer, dado el tamano reducido de los modelos.
- Compatibilidad con GPU consumer: previsiblemente si (cualquier GPU con 4-6 GB de VRAM o incluso CPU), aunque el autor no publica requisitos minimos.
- Opciones de despliegue: la aplicacion usa Ollama como runtime; no se documenta soporte de vLLM, llama.cpp directo, TGI ni otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Producto | Tipo | Modelo subyacente | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| COMPUTA 0.1.0 | App de escritorio local | llama3.2:3b + Whisper tiny + Piper | no disponible | MIT | Instaladores Windows/macOS en HF |
| Ollama (runtime) | Runtime de inferencia local | Multiples modelos | Segun modelo | MIT | Multiplataforma |
| LM Studio | App de escritorio local | Multiples modelos (GGUF) | Segun modelo | Propietaria (gratuita) | Windows/macOS/Linux |
| GPT4All | App de escritorio local | Multiples modelos | Segun modelo | MIT | Windows/macOS/Linux |

La comparacion es aproximada: COMPUTA es un producto empaquetado, no un modelo, y su diferenciador frente a alternativas es la integracion de voz (Whisper + Piper) y la ausencia total de telemetria, aunque con un unico modelo fijado y una version muy temprana (0.1.0).

## Limitaciones y advertencias

- No es un modelo: no debe citarse como modelo de IA ni evaluarse con benchmarks de modelos; es un instalador de aplicacion.
- Version 0.1.0: madurez muy baja, sin historial de mantenimiento ni issues publicos en el repositorio.
- Sin model card tecnica: no hay informacion sobre requisitos minimos, idiomas, limites de contexto ni comportamiento del pipeline de voz.
- Modelo subyacente fijado: `llama3.2:3b` es pequeno y limitado en razonamiento complejo, codigo y contextos largos; Whisper tiny tiene precision reducida en audio ruidoso y acentos marcados.
- Riesgo de alucinacion: inherente a `llama3.2:3b`, no mitigado de forma documentada.
- Seguridad: ejecutar instaladores `.exe` y `.command` de un autor sin reputacion verificada (0 descargas, 0 likes) exige revision previa y verificacion de integridad; la licencia MIT no ofrece garantias.
- Uso comercial: la licencia MIT del repositorio lo permite, pero deben revisarse las licencias de los componentes descargados (llama3.2 tiene su propia licencia de comunidad de Meta, no MIT).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maloxxxxxxx/computa-installer
- Instalador Windows: https://huggingface.co/maloxxxxxxx/computa-installer/resolve/main/COMPUTA%20Setup%200.1.0.exe
- Instalador macOS: https://huggingface.co/maloxxxxxxx/computa-installer/resolve/main/COMPUTA-Mac-Setup.command
- Ollama: https://ollama.com
- Modelo llama3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B
- Whisper (OpenAI): https://github.com/openai/whisper
- Piper (sintesis de voz): https://github.com/rhasspy/piper
