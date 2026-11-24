# mabijinx/uncharted-legacy-of-thieves-collecti-cheat

## Resumen

El repositorio `mabijinx/uncharted-legacy-of-thieves-collecti-cheat` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como archivo comprimido (`uncharted-legacy-of-thieves-collecti-cheat-trainer-v1.2.0-win64.zip`, 8,9 MB) que la model card describe como un "cheat trainer" para el videojuego *Uncharted: Legacy of Thieves Collection* en Windows de 64 bits. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La ficha se redacta, por tanto, sobre un artefacto que no cumple los criterios de un modelo de IA open source: no es un modelo de lenguaje, visión ni multimodal, no expone parámetros entrenados y su función declarada es la modificación de la memoria de un proceso de juego en ejecución (radar 2D, filtro de loot, suavizado de entrada tipo Bezier, escáner de offsets, etc.). Los tags de Hugging Face (`windows`, `x64`, `portable`, `trainer`) confirman esta naturaleza.

Se incluye esta ficha para dejar constancia técnica de la discrepancia entre la categoría del repositorio (aparentemente un modelo) y su contenido real, y para advertir de los riesgos asociados a su descarga y ejecución. Todos los campos propios de un modelo (arquitectura, parámetros, contexto, cuantización, benchmarks) se marcan como no disponibles porque no existen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable externo para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; aplicable a la interfaz del artefacto, no a un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es una red neuronal ni un modelo estadístico entrenado. La model card describe módulos de un programa externo en modo usuario que interactúa con el proceso del juego mediante lectura y escritura de memoria, escaneo de offsets y renderizado superpuesto (capa "stream-proof" orientada a evadir capturas de OBS, ShadowPlay y Discord). Los parámetros citados (respuesta < 20 ms, < 37 MB de RAM, polling a 221 Hz, 6-7 hilos de trabajo) son características de ejecución del programa, no del entrenamiento de un modelo.

No se documenta ningún corpus de entrenamiento, proceso de RLHF/DPO, tokenizador ni innovación algorítmica de aprendizaje automático. Cualquier interpretación del repositorio como modelo de lenguaje es incorrecta.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües se limitan, según los tags, a la localización de la interfaz del programa en 14 idiomas.
- Funciones declaradas por el autor (no verificadas): radar 2D con filtro de loot por rareza, suavizado de entrada Bezier con FOV configurable y VisCheck, escáner dinámico de offsets tras parches, tecla de pánico (`END`) para descarga inmediata y capa de render excluida de capturas de pantalla.

## Casos de uso

- Ninguno recomendado en un contexto de desarrollo de IA, investigación o producción de software legítimo.
- Uso declarado por el autor: modificar la experiencia de un videojuego monojugador en Windows. Este uso puede contravenir los términos de servicio de la plataforma y las condiciones de licencia del juego.
- Auditoría de seguridad: analizar en un entorno aislado (máquina virtual sin red, sin cuenta de juego asociada) el contenido del ZIP y del ejecutable para estudiar técnicas de evasión de captura o de manipulación de memoria.
- Docencia sobre riesgos de la cadena de suministro: ejemplo de repositorio que se presenta como modelo en Hugging Face pero distribuye un binario con contraseña en el archivo comprimido.
- Investigación de malware: extraer indicadores de compromiso (hashes, dominios, firmas) del binario para alimentar reglas de detección.
- No se identifican casos de uso válidos para inferencia, RAG, generación de código, atención al cliente ni ninguna otra aplicación típica de modelos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (según la model card).
- RAM declarada por el autor: menos de 37 MB durante la ejecución del módulo descrito.
- Tamaño del paquete: 8,9 MB comprimido; el ejecutable descomprimido no se detalla.
- GPU: no se requiere ni se documenta; el programa opera en modo usuario sobre el proceso del juego.
- VRAM estimada para inferencia: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: el autor cita < 20 ms de respuesta, < 32 ms para el escáner de offsets y polling a 221 Hz; son cifras no verificadas y relativas al programa, no a un modelo.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: el artefacto no es un modelo de IA. Frente a modelos de lenguaje open source (por ejemplo, familias Llama, Mistral o Qwen), la comparación es improcedente porque no comparten propósito, formato ni métricas.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en comparativas, catálogos o pipelines de inferencia.
- El ZIP se distribuye con contraseña (`2026`) y el ejecutable se lanza "como administrador"; ambos elementos son señales de riesgo habituales en la distribución de software no auditado.
- El binario manipula memoria de otro proceso y declara evasión de capturas de pantalla (OBS, ShadowPlay, Discord), lo que dificulta su trazabilidad y auditoría.
- Uso potencialmente contrario a los términos de servicio de la plataforma del juego y a la legislación de protección de software en algunas jurisdicciones.
- Riesgo de seguridad: ejecutar un binario sin firma ni verificación de integridad con privilegios elevados puede comprometer el sistema anfitrión.
- La licencia MIT del repositorio no cubre los derechos del videojuego ni garantiza la legalidad del uso del artefacto.
- Los enlaces de descarga apuntan a un repositorio de GitHub (`JanetHart1359/...`) distinto del identificador de Hugging Face, lo que añade opacidad sobre la cadena de suministro.
- Los idiomas listados corresponden a la interfaz del programa, no a capacidades lingüísticas de un modelo.
- Cero descargas y cero "likes" en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mabijinx/uncharted-legacy-of-thieves-collecti-cheat
- Repositorio de GitHub citado en la model card: https://github.com/JanetHart1359/uncharted-legacy-of-thieves-collecti-cheat-trainer
- Descarga directa citada por el autor (no recomendada): https://github.com/JanetHart1359/uncharted-legacy-of-thieves-collecti-cheat-trainer/releases/latest/download/uncharted-legacy-of-thieves-collecti-cheat-trainer-v1.2.0-win64.zip
- Página de releases citada por el autor: https://github.com/JanetHart1359/uncharted-legacy-of-thieves-collecti-cheat-trainer/releases/latest
