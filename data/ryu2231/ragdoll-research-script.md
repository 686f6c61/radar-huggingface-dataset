# Ryu2231/ragdoll-research-script

## Resumen

El repositorio identificado como `Ryu2231/ragdoll-research-script` no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido a través de Hugging Face y presentado con la apariencia de una herramienta "portable" de investigación, pero cuya model card describe funcionalidades propias de un software de trampas para videojuegos: escáner dinámico de offsets, suavizado de entrada tipo bezier, superposición externa a 144 Hz, cajas delimitadoras 2D/3D, ESP de esqueletos y perfiles JSON intercambiables en caliente.

El artefacto se distribuye como un archivo ZIP de 4,8 MB protegido con contraseña (`2026`) que contiene un binario `rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, alojado en un repositorio de GitHub de terceros y no en el propio Hugging Face. La model card incluye insignias de descargas y valoraciones no verificables (67K descargas, 4,8/5), lo que junto con la nomenclatura de "cheat mod menu" apunta a una campaña de distribución de software potencialmente malicioso disfrazado de modelo o herramienta.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto ni capacidades de inferencia porque no existen: no hay pesos, no hay tokenizador, no hay pipeline declarado y el repositorio no contiene material propio de un modelo de lenguaje. Los campos técnicos se marcan como "no disponible" y se advierte explícitamente del riesgo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, no del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido descrito en la model card corresponde a un binario Windows (`rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, build `v3.7.1` / `2F644E`) que, según el propio texto, opera en modo usuario con "Desktop Duplication" y evita hooks de DLL internos. Las supuestas capacidades técnicas (escáner de offsets, overlay a 362 Hz de sondeo, exclusión de captura de pantalla en OBS/ShadowPlay/Discord) son funciones de un software de asistencia en juegos, no de un modelo generativo.

No se declara número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o SFT. No hay innovaciones de inferencia como decodificación especulativa o atención lineal porque no hay inferencia de lenguaje implicada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües listadas en los metadatos son etiquetas del repositorio, no del artefacto.
- Las funciones descritas en la model card son de tipo overlay y modificación de memoria en juegos (escáner de offsets, ESP, suavizado de puntería), ajenas al ámbito de esta ficha.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones legítimas de inferencia, generación o análisis documental.
- No es adecuado para atención al cliente, generación de código, análisis de datos, RAG ni pipelines de CI/CD.
- No debe integrarse en entornos de producción, investigación ni docencia.
- Cualquier uso del binario distribuido implica ejecutar código de procedencia no verificada en un equipo Windows, con el riesgo asociado de malware.
- No se recomienda su descarga, extracción ni ejecución.
- Para necesidades reales de IA open source, conviene acudir a repositorios con pesos verificables (safetensors/GGUF), model cards técnicas y pipelines declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible.
- Requisito declarado por el autor: Windows 10/11 de 64 bits y ejecución como administrador del binario.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de lenguaje o multimodal.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha se completa por rigor documental, no porque exista material técnico que evaluar.
- Riesgo de seguridad alto: binario `.exe` distribuido en ZIP con contraseña y alojado en un repositorio de GitHub de terceros, técnica habitual para evadir análisis automatizados.
- Indicadores de engaño: insignias de descargas y valoraciones no verificables, nomenclatura de "cheat mod menu" y contraseña de extracción fija.
- La licencia MIT declarada no otorga garantías sobre el contenido del binario ni sobre su comportamiento en ejecución.
- Sin trazabilidad de autoría ni repositorio de código fuente auditable.
- No apto para uso comercial, producción ni investigación.
- Recomendación: no descargar, no extraer y no ejecutar; reportar el repositorio a Hugging Face si se confirma la suplantación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ryu2231/ragdoll-research-script
- Repositorio GitHub referenciado en la model card: https://github.com/alexandros6727/ragdoll-research-script
- Repositorio GitHub del binario: https://github.com/Shuji50/rob-run-cheat-mod-menu-pc
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información disponible.
