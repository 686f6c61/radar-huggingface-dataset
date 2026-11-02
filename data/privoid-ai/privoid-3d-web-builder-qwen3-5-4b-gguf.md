# Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B-GGUF

## Resumen

Privoid-3D-Web-Builder-Qwen3.5-4B-GGUF es la distribucion en formato GGUF del modelo Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B, un ajuste fino orientado a la generacion de aplicaciones web 3D con Next.js y Three.js y al uso de tool calling. El modelo parte de una base Qwen3.5 de 4B parametros (4.326.350.848 parametros totales segun los safetensors del modelo original) y se publica bajo licencia Apache 2.0 por el usuario Privoid-ai. Esta version GGUF es la V1; el autor indica que trabaja en una V2.

El interes practico del modelo esta en su especializacion: no es un modelo generalista, sino un modelo pequeno pensado para escribir ficheros de codigo en un flujo agéntico de construccion web 3D. La model card menciona explicitamente soporte de plantilla de chat con herramientas (recomienda arrancar con `llama-server -m FILE --jinja`) y que el tool call `write_file` funciona en la comprobacion de carga de todas las cuantizaciones publicadas.

Al tratarse de un modelo de 4B en GGUF, su principal atractivo es el despliegue local en hardware de consumo y la integracion en pipelines de generacion de codigo con herramientas. La informacion publica disponible es escasa: no hay datos de benchmarks, idiomas ni pipeline en la ficha de HuggingFace, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B, que a su vez se apoya en una base Qwen3.5 de 4B parametros. La arquitectura es de tipo transformer, aunque la informacion proporcionada no detalla la configuracion interna (numero de capas, dimension oculta, atencion, etc.). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO.

La innovacion declarada por el autor es la especializacion en un dominio concreto: generacion de codigo para aplicaciones web 3D (Next.js y Three.js) con soporte de tool calling. La model card indica que la plantilla de chat y las herramientas funcionan al arrancar el servidor con `--jinja`, y que el tool call `write_file` se ejecuta correctamente en la comprobacion de carga de todas las cuantizaciones. No se documentan otras innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de codigo orientada a aplicaciones web 3D con Next.js y Three.js.
- Tool calling / function calling, con verificacion del tool call `write_file` en todas las cuantizaciones publicadas.
- Uso en flujos agénticos de escritura de ficheros dentro de un proyecto web.
- Conversacion multi-turno mediante plantilla de chat (requiere `--jinja` en llama-server).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Razonamiento general, matematicas, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de escenas Three.js: el modelo puede producir ficheros de codigo con geometria, materiales e iluminacion para una escena 3D, usando el tool call `write_file` para volcar el resultado en el proyecto.
- Andamiaje de proyectos Next.js: generacion de componentes, paginas y estructura de rutas en un flujo agéntico, adecuado por su especializacion en el stack Next.js.
- Asistente de desarrollo local: al ser un GGUF de 4B, puede ejecutarse en una maquina de desarrollo sin GPU dedicada y asistir en tareas de codigo sin enviar datos a la nube.
- Prototipado rapido de demos 3D: generacion de codigo inicial para visualizaciones o configuradores 3D, con iteracion conversacional sobre los ficheros escritos.
- Integracion en pipelines de generacion de codigo: el soporte de tool calling y la plantilla Jinja permiten conectarlo a orquestadores que esperan llamadas a funciones estructuradas.
- Educacion y experimentacion: modelo pequeno y de licencia permisiva para estudiar ajustes finos especializados en codigo y tool calling sin coste de infraestructura elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al modelo base para benchmarks y limitaciones, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB para Q3_K_M, 2,8 GB para Q4_K_M, 3,2 GB para Q5_K_M, 3,6 GB para Q6_K, 4,6 GB para Q8_0 y 8,7 GB para BF16 (tamanos de fichero indicados por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabe en GPUs de consumo con 6-8 GB de VRAM en cuantizaciones Q4_K_M o superiores.
- Cabe en GPU de consumo: si, en tarjetas con al menos 4-6 GB de VRAM para cuantizaciones Q3-Q5; las cuantizaciones Q8_0 y BF16 requieren mas memoria.
- Opciones de despliegue: llama.cpp / llama-server (recomendado por el autor con `--jinja`), y por compatibilidad GGUF, otros runners como Ollama o LM Studio (no confirmado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Version V1: el autor indica que la version principal (V2) esta en desarrollo, por lo que la V1 puede presentar carencias funcionales.
- Especializacion estrecha: el ajuste esta orientado a web 3D con Next.js y Three.js; su rendimiento en tareas generales puede ser inferior al de la base Qwen3.5-4B.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje pequenos; el codigo generado debe revisarse antes de usarse en produccion.
- Idiomas: no se especifican los idiomas soportados.
- Contexto: no se documenta la longitud de contexto, lo que dificulta planificar conversaciones o proyectos largos.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las condiciones de la base Qwen3.5 y de los datos de ajuste.
- Requiere `--jinja` en llama-server para que la plantilla de chat y las herramientas funcionen correctamente.

## Enlaces

- Modelo GGUF: https://huggingface.co/Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Privoid-ai/Privoid-3D-Web-Builder-Qwen3.5-4B
