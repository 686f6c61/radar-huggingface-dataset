# Miguelms13/Wiguel-AI-GGUF

## Resumen

Wiguel-AI Core Engine es un modelo de lenguaje conversacional ligero, desarrollado por Miguelms13, diseñado para ejecutarse de forma local en el dispositivo del usuario, ya sea directamente en el navegador mediante WebGPU/WebWorker o a través de un script puente en Python. Su objetivo principal es ofrecer un asistente personal con baja latencia y máxima privacidad, sin depender de servidores centrales, y con capacidad de funcionamiento offline una vez que los pesos se han descargado o cacheado.

El modelo cuenta con aproximadamente 1.240 millones de parámetros (1.235.814.432) y se distribuye en formato GGUF, lo que facilita su uso en entornos de inferencia local como llama.cpp, Ollama o similares. Está pensado para integrarse en aplicaciones web progresivas (PWA) y sistemas que requieran un asistente conversacional con control total de los datos. Su relevancia actual radica en la tendencia hacia la inferencia local y la privacidad, así como en la posibilidad de desplegar modelos de tamaño medio en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.235.814.432 (~1,24 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, se asume cuantizacion variable) |
| Idiomas soportados | en, es |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo (tipo de transformer, numero de capas, dimensiones, etc.) ni sobre el proceso de entrenamiento (dataset, numero de tokens, tecnicas de alineamiento como RLHF o DPO). El autor indica que el modelo esta optimizado para baja latencia y ejecucion local, pero no se ofrecen datos tecnicos adicionales en la model card. Se desconoce si se trata de un modelo original o de un fine-tuning de una base existente.

## Capacidades

- Generacion de texto conversacional: responde consultas directas y mantiene dialogos multi-turno.
- Asistente interactivo: disenado para integrarse en interfaces de usuario, especialmente en aplicaciones web progresivas (PWA).
- Procesamiento de lenguaje natural en ingles y espanol.
- Ejecucion local en el navegador mediante WebGPU y WebWorker, sin envio de datos a servidores externos.
- Modo hibrido/bridge: mediante un script Python (wiguel-bridge.py) puede comunicarse con recursos locales, gestionar descargas en segundo plano y ofrecer inferencia offline.
- Operacion offline: una vez que los pesos se han descargado o cacheado, el modelo puede funcionar sin conexion a internet.
- Limpieza automatica: el bridge elimina los archivos temporales y el modelo descargado al cerrar la sesion.

## Casos de uso

- Asistente personal en el navegador: integrado en una PWA, el modelo responde preguntas y mantiene conversaciones directamente en la pagina web, sin necesidad de backend, garantizando la privacidad del usuario.
- Chatbot para sitios web con requisitos estrictos de privacidad: al ejecutarse en el cliente, los datos de los usuarios no salen del dispositivo, lo que lo hace adecuado para sectores como salud o banca.
- Aplicacion de escritorio con inferencia local: mediante el bridge Python, se puede conectar a aplicaciones de escritorio que necesiten un asistente conversacional sin depender de la nube.
- Herramienta de soporte tecnico offline: en entornos sin conexion (por ejemplo, zonas remotas o redes aisladas), el modelo puede proporcionar respuestas a preguntas frecuentes o guias de resolucion de problemas.
- Prototipado rapido de asistentes conversacionales: al ser un modelo pequeno y en formato GGUF, se puede integrar facilmente en demos o pruebas de concepto con hardware modesto.
- Sistema de respaldo para aplicaciones cloud: si el servicio principal falla, el modelo puede actuar como fallback local para mantener la disponibilidad del asistente, como se indica en los tags del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 1,24 B parametros en formato GGUF, se estima que una cuantizacion de 4 bits (Q4_K_M) ocuparia alrededor de 0,7-0,8 GB de VRAM, por lo que cabria en GPUs con 2 GB o mas de memoria.
- Puede ejecutarse en GPUs de consumo como NVIDIA GTX 1650, RTX 2060, RTX 3060, etc., asi como en Apple Silicon (M1/M2) mediante Metal.
- Tambien es posible ejecutarlo en CPU, aunque con mayor latencia; para uso interactivo se recomienda al menos 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o directamente en el navegador via WebGPU (como indica la model card).
- No se dispone de datos oficiales de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable con otros modelos de tamano similar (por ejemplo, TinyLlama-1.1B, Qwen1.5-1.8B o Phi-2). No se conocen los resultados de benchmarks ni las caracteristicas tecnicas completas de Wiguel-AI, por lo que no es posible establecer una comparacion objetiva.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que genera incertidumbre sobre su uso comercial y la redistribucion. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo relativamente pequeno, es probable que presente dificultades en tareas de razonamiento complejo o generacion de codigo avanzado.
- El modelo solo soporta ingles y espanol; no se garantiza un rendimiento adecuado en otros idiomas.
- La ejecucion en el navegador depende de la compatibilidad con WebGPU, que no esta disponible en todos los navegadores o dispositivos.
- El script bridge requiere Python y puede implicar riesgos de seguridad si se ejecuta en entornos no controlados, ya que gestiona descargas y limpieza de archivos.
- No hay garantias de soporte o mantenimiento a largo plazo, dado que el proyecto parece ser de un desarrollador individual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Miguelms13/Wiguel-AI-GGUF
- Aplicacion Wiguel-AI: https://wiguel-ai.vercel.app/
- Script bridge (GitHub): https://github.com/Miguelms13/wiguel-bridge/blob/main/wiguel-bridge.py
