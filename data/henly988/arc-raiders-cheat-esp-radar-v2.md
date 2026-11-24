# henly988/arc-raiders-cheat-esp-radar-v2

## Resumen

`henly988/arc-raiders-cheat-esp-radar-v2` no es un modelo de IA. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un supuesto paquete ejecutable para Windows (un "cheat" o trampa con ESP y radar) orientado al videojuego *Arc Raiders*. El autor lo publica bajo la etiqueta `license:mit`, pero no incluye pesos, arquitectura, tokenizador ni ningún artefacto propio de un modelo de lenguaje, visión o multimodal.

La model card describe un binario `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB protegido con contraseña, con supuestas funciones de overlay externo, ESP de cajas delimitadoras, suavizado de entrada y capas "stream-proof". Estos elementos son característicos de software de trampas para videojuegos, no de un modelo entrenado. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Desde la perspectiva de evaluación de modelos, esta ficha no puede aportar especificaciones técnicas de IA porque no existen. El interés, si lo hay, es de naturaleza distinta: documentar un caso de uso indebido de Hugging Face como plataforma de distribución de ejecutables potencialmente maliciosos, y advertir a desarrolladores e investigadores de que no deben ejecutar binarios descargados desde repositorios de modelos sin verificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el repositorio distribuye un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido descrito en la model card es un ejecutable nativo de 64 bits para Windows 10/11, empaquetado en un archivo ZIP de 4,8 MB con contraseña `2026`, que el autor presenta como herramienta de overlay externo con módulos de ESP y radar. No se aportan datos sobre conjuntos de entrenamiento, tokens, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia, porque no aplica.

El material de la model card incluye además referencias cruzadas a otros repositorios y nombres de binarios (`kingdom-come-deliverance-2-trainer-2026-...`) que no guardan relación con el título del repositorio. Esta incoherencia entre nombre del repo, nombre del binario y contenido descrito es una señal de alarma típica de campañas de distribución de software no verificado.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni imágenes.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas de indexación, no competencia lingüística.
- El binario descrito afirma ofrecer overlay externo, ESP de cajas 2D/3D, esqueletos de huesos, indicación de distancia, perfiles JSON intercambiables en caliente y suavizado de entrada tipo Bézier, orientados a ventajas competitivas en un videojuego.

## Casos de uso

- No procede. Al no ser un modelo de IA, no tiene aplicaciones legítimas de generación, análisis o razonamiento.
- Documentación de seguridad: un equipo de seguridad puede usar este repositorio como ejemplo de distribución de ejecutables no verificados bajo apariencia de "modelo" en Hugging Face.
- Formación en detección de fraudes: sirve para ilustrar patrones de ingeniería social (contraseña en el ZIP, botones de descarga, insignias de "512K+ descargas" no verificables).
- Análisis de reputación de plataformas: útil para estudiar cómo se cuelan artefactos ajenos a modelos en catálogos de IA.
- Investigación de malware: un analista puede examinar el binario en un entorno aislado para caracterizar su comportamiento.
- Concienciación de usuarios: material para advertir de que descargar y ejecutar binarios de repositorios de modelos conlleva riesgos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación de modelos, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- No aplica en términos de VRAM o GPU para inferencia de un modelo.
- El binario descrito se ejecuta en Windows 10/11 de 64 bits, sin dependencias externas declaradas.
- El autor afirma un uso de memoria inferior a 63 MB de RAM para el módulo de "panic key unload" y menos de 56 MB para el núcleo en modo usuario, con sondeo a 463 Hz y 7 hilos de trabajo; estas cifras no son verificables y provienen únicamente de la model card.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia de modelos.
- Latencia y throughput: no disponibles (los valores citados en la model card se refieren al software, no a un modelo).

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Comparar con LLM como Llama, Mistral o Qwen carecería de sentido: no comparten naturaleza, propósito ni artefactos.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de uso como tal es errónea.
- El repositorio distribuye un ejecutable de procedencia no verificada. Ejecutarlo como administrador, tal y como indica la model card, otorga privilegios elevados a código de origen desconocido.
- La contraseña del ZIP (`2026`) y los botones de descarga apuntan a repositorios de GitHub de terceros, no al propio Hugging Face; esto dificulta la trazabilidad y la verificación de integridad.
- Los contadores de descargas e insignias de la model card (512K+, tamaño, build) no están respaldados por los metadatos del repositorio, que registra 0 descargas y 0 likes.
- El software se presenta como trampa para un videojuego, lo que puede violar los términos de servicio de dicho juego y acarrear el bloqueo de cuentas.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del binario; una licencia permisiva no equivale a código auditado.
- No se debe ejecutar en máquinas de producción, entornos corporativos ni equipos con datos sensibles.
- No hay evidencia de auditoría, firma de código ni reproducibilidad de compilación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/henly988/arc-raiders-cheat-esp-radar-v2
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub, terceros): https://github.com/NoahWalker034/arc-raiders-cheat-esp-radar-v2/releases/latest
- No se han encontrado papers, blogs técnicos, demos ni repositorios oficiales asociados a un modelo de IA en la información disponible.
