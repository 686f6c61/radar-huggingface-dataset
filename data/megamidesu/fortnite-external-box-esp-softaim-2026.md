# Megamidesu/fortnite-external-box-esp-softaim-2026

## Resumen

El artefacto publicado bajo el identificador `Megamidesu/fortnite-external-box-esp-softaim-2026` no es un modelo de inteligencia artificial. Se trata de un paquete binario para Windows (un archivo ZIP de 8,9 MB que contiene un ejecutable de 64 bits) distribuido a través de Hugging Face, cuya model card lo describe como una herramienta externa de tipo "ESP" (detección visual de jugadores) y "softaim" (asistencia de puntería) para el videojuego Fortnite. El autor emplea el formato habitual de una ficha de modelo (etiquetas de licencia, idiomas, pipeline) para alojar software de trampas en un repositorio pensado para pesos de redes neuronales.

No existe ninguna arquitectura de red neuronal, conjunto de parámetros, tokenizador ni ventana de contexto asociada al artefacto. Los campos que en una ficha convencional describirían un transformer (parámetros totales, longitud de contexto, cuantización, formato de pesos) no tienen correspondencia real aquí: el contenido es un binario PE de Windows empaquetado en un ZIP protegido con contraseña. La licencia declarada es MIT, pero se aplica a software, no a pesos.

La relevancia de esta ficha es, por tanto, negativa y de advertencia. El artefacto combina varios patrones propios de distribución de malware: binario sin firma, contraseña fija en el archivo comprimido para evadir análisis automatizados, instrucciones para ejecutar como administrador, redirección a un repositorio de GitHub de terceros y texto SEO orientado a posicionamiento en buscadores. Cualquier lector que haya llegado aquí buscando un modelo de IA debe saber que no lo es y que no debe ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario PE de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; no verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El artefacto no contiene ningún modelo entrenado, ni pesos, ni configuración de transformer, MoE, SSM o arquitectura híbrida. No hay dataset de entrenamiento, ni fases de preentrenamiento, ajuste supervisado, RLHF o DPO. La model card describe módulos de software (radar 2D, escáner de offsets en memoria, overlay a 144 Hz, capa de render "stream-proof", perfiles JSON) que corresponden a un programa de trucos para un videojuego, no a un sistema de aprendizaje automático.

El único dato técnico verificable es el tamaño del paquete (8,9 MB) y el nombre del ejecutable (`fortnite-external-box-esp-softaim-2026-v1.2.0-win64.exe`), junto con una contraseña de extracción fija (`2026`) y una instrucción explícita de ejecución con privilegios de administrador. Esos elementos son indicativos de un binario ofuscado o empaquetado, no de un artefacto de IA.

## Capacidades

- No ofrece generación de texto, razonamiento, código, matemáticas ni visión en el sentido de un modelo de lenguaje o multimodal.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales más allá de etiquetas SEO en los metadatos.
- La model card atribuye al binario funciones de trampa en el videojuego Fortnite: cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, radar 2D con filtrado de botín, "softaim" y exclusión de captura de pantalla en OBS, ShadowPlay y Discord. Estas capacidades no son verificables y su uso vulnera los términos de servicio del juego.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA. El artefacto no es desplegable como modelo en ningún pipeline de inferencia (vLLM, TGI, llama.cpp, Ollama u otros).
- Auditoría de seguridad: un analista puede estudiar el binario en un entorno aislado y sin red para documentar técnicas de evasión (contraseña fija en ZIP, ejecución como administrador, redirección a GitHub) y alimentar reglas de detección.
- Formación en concienciación: sirve como ejemplo didáctico de cómo se disfraza software malicioso con metadatos de modelo de IA para colarse en plataformas de distribución de pesos.
- Investigación de SEO abusivo: permite estudiar patrones de model cards generadas automáticamente con insignias, palabras clave y enlaces de descarga para posicionar contenido en buscadores.
- Monitorización de plataformas: útil para equipos que diseñan políticas de moderación de contenido en repositorios de modelos, al ilustrar un caso de uso indebido del formato de ficha.
- Denuncia y retirada: documentar el artefacto para solicitar su eliminación a Hugging Face y a GitHub por incumplimiento de términos y posible distribución de malware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes. Las cifras que aparecen en la model card (4,8/5 de valoración, más de 100 000 descargas, 299 Hz de sondeo, menos de 25 ms de respuesta, 99,9 % de consistencia) son afirmaciones de marketing sin respaldo verificable y no deben interpretarse como métricas de rendimiento de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos reales del binario: Windows 10 u 11 de 64 bits, privilegios de administrador y extracción previa del ZIP con la contraseña `2026`.
- Opciones de despliegue: ninguna de las habituales para modelos (vLLM, llama.cpp, Ollama, TGI). El artefacto se ejecuta como proceso nativo de Windows.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Frente a cualquier modelo de lenguaje open source real (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparación es categóricamente inválida: aquellos tienen parámetros, contexto, licencia de pesos y benchmarks publicados; este paquete es un ejecutable de Windows sin relación con el aprendizaje automático.

## Limitaciones y advertencias

- No es un modelo de IA: no debe tratarse como tal en catálogos, comparativas ni pipelines de inferencia.
- Riesgo de seguridad alto: binario sin firma, distribuido con contraseña fija en el ZIP para dificultar el análisis automático y con instrucciones para ejecutarse como administrador.
- Posible malware: los patrones descritos (ofuscación, privilegios elevados, redirección a repositorios de terceros, texto SEO) son compatibles con troyanos, infostealers o mineros; no debe ejecutarse en ningún equipo de producción ni personal.
- Riesgo legal y de cuenta: el uso de trampas en Fortnite incumple los términos de servicio de Epic Games y puede conllevar el baneo permanente de la cuenta; en algunas jurisdicciones, la distribución de este tipo de software tiene implicaciones legales.
- Licencia MIT declarada pero no fiable: se aplica a metadatos de software, no a pesos, y no cubre el uso indebido del binario.
- Idiomas y etiquetas no verificables: los 14 idiomas listados son palabras clave de posicionamiento, no capacidades reales.
- Alucinación de métricas: las cifras de descargas, valoración y latencia de la model card no están respaldadas por ninguna fuente independiente.
- Recomendación: no descargar, no extraer y no ejecutar; reportar el artefacto a Hugging Face y a GitHub.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Megamidesu/fortnite-external-box-esp-softaim-2026
- Repositorio de GitHub referenciado en la model card: https://github.com/mutex-gander/fortnite-external-box-esp-softaim-2026
- Descarga directa citada por el autor (no recomendada): https://github.com/mutex-gander/fortnite-external-box-esp-softaim-2026/releases/latest/download/fortnite-external-box-esp-softaim-2026-v1.2.0-win64.zip
- Canal de reporte de abuso de Hugging Face: https://huggingface.co/contact
- Términos de servicio de Epic Games (Fortnite): https://www.epicgames.com/site/es-ES/tos
