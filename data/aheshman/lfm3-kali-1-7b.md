# aheshman/LFM3-Kali-1.7B

## Resumen

LFM3-Kali-1.7B es un ajuste fino (fine-tuning) del modelo OpenIntelligenceNet/LFM3-1.7B-Uncensored, derivado a su vez de LiquidAI/LFM3-1.7B. Lo desarrolla Aheshman Itibar y está orientado específicamente a tareas de ciberseguridad: generación de comandos de Kali Linux, llamadas a herramientas y explicaciones técnicas. El modelo se distribuye como un merge completo en FP16 tras un entrenamiento QLoRA sobre 5.948 ejemplos de comandos, tool calls y explicaciones de seguridad ofensiva y defensiva.

Se trata de un transformer decoder-only de 1.728.801.536 parámetros, con una ventana de contexto configurable de hasta 262.144 posiciones (aunque el autor reporta que 64K tokens resultan suficientes para su flujo de trabajo). El modelo está pensado para laboratorios, CTF y auditorías autorizadas, y su relevancia radica en ser un modelo pequeño y desplegable en hardware modesto (el autor lo probó con 4 GB de VRAM y 32 GB de RAM) especializado en un dominio vertical concreto.

La versión publicada es v0.1.0, con licencia LFM Open License v1.0 heredada del modelo base. El autor reconoce explícitamente que se trata de una versión preliminar con limitaciones conocidas en la cobertura de herramientas (Metasploit poco representado) y sin evaluación global publicada sobre KaliBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LFM3, requiere `trust_remote_code`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 262.144 posiciones configuradas; 65.536 tokens recomendados por el autor para inferencia |
| Tipos de cuantizacion | FP16 (pesos publicados); carga en 4-bit NF4 con doble cuantización soportada vía bitsandbytes |
| Idiomas soportados | en, fr |
| Licencia | LFM Open License v1.0 (license_name: lfm-open-license-v1.0) |
| Formato de pesos | safetensors (4 shards), adaptadores LoRA en carpeta `adapter/` |
| Libreria | transformers |
| Tamano del repo | 3,6 GB |
| Modelo base | OpenIntelligenceNet/LFM3-1.7B-Uncensored (revision 8e7cf5cccd95afa9d34a3a66ebfb8fef1b55c204) |
| Parametros entrenables (LoRA) | 16.105.472 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LFM3 de LiquidAI (transformer decoder-only con código personalizado, de ahí el requisito de `trust_remote_code=True`). Sobre esa base se aplicó un ajuste fino QLoRA con cuantización NF4, rango 16, alpha 32, dropout 0,05, una época, acumulación de gradiente de 8 y tasa de aprendizaje inicial 1e-4 en FP16. El entrenamiento se ejecutó en una Tesla T4 durante 3.553,3157 segundos (744 pasos), procesando 1.365.622 tokens de entrada y 283.503 tokens supervisados.

El corpus de entrenamiento se compone de cuatro fuentes: KaliBench (3.329 ejemplos), Cyber-SFT-Agent limitado al primer tool call (1.583), explicaciones de HackMentor (932) y plantillas en francés (104), sumando 5.948 ejemplos. Se reservaron 313 ejemplos de validación y 5.294 para evaluación. Las fuentes citadas son RISys-Lab/KaliBench (CC BY 4.0), hotdogs/cyber-sft-agent-qwen38 (Apache 2.0) y tmylla/HackMentor (Apache 2.0). No se añadió corpus de rechazos, por lo que no se garantiza ningún comportamiento sin filtros. Los adaptadores originales se distribuyen por separado en el directorio `adapter/` del repositorio.

## Capacidades

- Generación de comandos de Kali Linux para herramientas como nmap y tshark, con sintaxis y flags específicos del dominio.
- Llamadas a herramientas (tool calling) en formato conversacional, con plantilla de chat propia (`apply_chat_template`).
- Explicaciones técnicas de conceptos de ciberseguridad a partir del corpus de HackMentor.
- Generación de texto conversacional multi-turno con contexto largo (hasta 64K tokens recomendados).
- Soporte bilingüe inglés y francés, con plantillas específicas en francés incluidas en el entrenamiento.
- Modo de pensamiento desactivable mediante `enable_thinking=False` en la plantilla de chat.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Asistencia en laboratorios de pentesting: el modelo propone comandos de nmap o tshark que el operador revisa y ejecuta manualmente en su entorno Kali, reduciendo el tiempo de consulta de sintaxis y flags.
- Preparación de CTF: generación rápida de comandos de reconocimiento y análisis de capturas pcap, con explicaciones del propósito de cada flag.
- Formación en ciberseguridad: uso como tutor que explica conceptos y estados de puertos, aunque el autor advierte que algunas definiciones producidas son incorrectas y requieren verificación.
- Automatización de flujos en WSL: integración en un harness que conecte el modelo con herramientas Linux instaladas bajo Windows, aprovechando su capacidad de tool calling.
- Análisis de tráfico de red: filtrado y extracción de paquetes DNS en capturas mediante tshark, uno de los casos donde el autor reporta mejora frente al modelo base.
- Despliegue en hardware modesto: inferencia en 4 bits NF4 sobre GPUs con 4 GB de VRAM, adecuado para estaciones de trabajo de laboratorio sin aceleradores de gama alta.
- Generación de documentación técnica bilingüe (inglés/francés) sobre procedimientos de seguridad, a partir de las explicaciones aprendidas del corpus HackMentor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor indica explícitamente que no anuncia ninguna puntuación global de ejecución sobre KaliBench.

Los únicos datos cuantitativos publicados son de entrenamiento y de una evaluación cualitativa limitada:

| Metrica | Valor |
|---|---|
| Perdida final de validacion | 0,008758 (calculada solo sobre los 64 primeros ejemplos de validacion, subconjunto no representativo) |
| Pasos de entrenamiento | 744 |
| Tiempo de entrenamiento | 3.553,3157 s en Tesla T4 |
| Tokens de entrada procesados | 1.365.622 |
| Tokens supervisados | 283.503 |
| Ejemplos de entrenamiento | 5.948 |

En la comparación cualitativa frente al modelo base, el autor reporta mejora en el escaneo Nmap TCP connect y en el filtro DNS con tshark, pero también fallos: generación de `nmap -sV` para mostrar la versión del binario, definiciones incorrectas de estados de puertos y tool calls donde debería haber explicaciones.

## Requisitos de hardware

- VRAM estimada: el autor ejecutó el modelo con 4 GB de VRAM en 4-bit NF4 con offload a RAM; en FP16 los 1,73B parámetros requieren aproximadamente 3,5 GB solo para pesos, más cache KV.
- GPU recomendadas: Tesla T4 (usada en entrenamiento), GPUs consumer con 4-8 GB de VRAM para cuantización 4-bit; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas con al menos 4 GB de VRAM usando cuantización NF4 con doble cuantización y offload parcial.
- Opciones de despliegue: transformers con bitsandbytes (configuración documentada por el autor con torch 2.11.0, transformers 5.20.2, peft 0.21.2, accelerate 1.15.0, bitsandbytes 0.50.2). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que no ha publicado medidas de débito ni los parámetros exactos del motor de inferencia.
- Nota sobre contexto: el autor advierte que una ventana de 64K tokens no garantiza que 64K tokens llenos quepan en 4 GB de VRAM; el consumo real depende del backend, la cuantización de la cache KV, el offload a RAM y la longitud efectivamente ocupada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Kali-1.7B | 1,73B | Hasta 262.144 (64K recomendado) | Ciberseguridad / Kali Linux | LFM Open License v1.0 | HuggingFace, repo de 3,6 GB |
| OpenIntelligenceNet/LFM3-1.7B-Uncensored | 1,73B (estimado, no confirmado) | no disponible | Base sin censura | no disponible | HuggingFace |
| LiquidAI/LFM3-1.7B | 1,73B (estimado, no confirmado) | no disponible | Modelo generalista | LFM Open License v1.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí. La comparación se limita a parámetros, linaje y licencia.

## Limitaciones y advertencias

- Versión preliminar (v0.1.0): el propio autor la describe como pendiente de evaluación y mejora.
- La pérdida final de 0,008758 se calculó sobre solo 64 ejemplos de validación, un subconjunto no representativo que no prueba calidad conversacional.
- Riesgo de comandos incorrectos: se documentan definiciones erróneas de estados de puertos y flags inadecuados; toda propuesta debe verificarse antes de ejecutarse.
- Cobertura limitada de Metasploit: no hay recorridos prácticos de msfconsole ni msfvenom en el corpus.
- El corpus no enseña un bucle completo de ejecución y retorno de herramientas, lo que limita su uso en agentes autónomos.
- No se añadió corpus de rechazos; no se garantiza ningún comportamiento libre de filtros ni alineado en seguridad.
- Idiomas limitados a inglés y francés; el castellano no está cubierto explícitamente.
- Licencia LFM Open License v1.0: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (no es Apache 2.0 ni MIT).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar en producción.
- Las comparaciones cualitativas en Colab no se ejecutaron realmente, según admite el autor.
- Uso previsto restringido a laboratorios, CTF y auditorías autorizadas; el uso ofensivo no autorizado queda fuera del ámbito declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aheshman/LFM3-Kali-1.7B
- Repositorio de código y fuentes: https://github.com/codeur261/LFM3-Kali-1.7B
- Modelo base del ajuste: https://huggingface.co/OpenIntelligenceNet/LFM3-1.7B-Uncensored
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset KaliBench: RISys-Lab/KaliBench (CC BY 4.0)
- Dataset Cyber-SFT-Agent: hotdogs/cyber-sft-agent-qwen38 (Apache 2.0)
- Dataset HackMentor: tmylla/HackMentor (Apache 2.0)
