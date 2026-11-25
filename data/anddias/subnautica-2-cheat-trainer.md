# anddias/subnautica-2-cheat-trainer

## Resumen

`anddias/subnautica-2-cheat-trainer` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es una supuesta aplicación ejecutable para Windows x64 presentada como "cheat trainer" para el videojuego Subnautica 2. El artefacto principal es un binario `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB protegido con contraseña, distribuido a través de enlaces externos a GitHub. No existe ningún peso de modelo, arquitectura neuronal, tokenizador ni configuración de inferencia en el repositorio.

La model card describe módulos de superposición externa, suavizado de entrada tipo bezier, exclusión de captura de pantalla y un "panic key" de descarga, terminología propia de software de trampas para videojuegos, no de modelos de lenguaje. El repositorio se etiqueta con idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y con `license:mit`, pero estas etiquetas no corresponden a capacidades lingüísticas reales de un modelo.

Desde la perspectiva de evaluación de IA open source, este repositorio carece de relevancia técnica: no hay modelo que evaluar. Su presencia en Hugging Face constituye un caso de uso indebido de la plataforma para distribuir ejecutables de terceros, con los riesgos de seguridad asociados (binarios ofuscados, contraseñas en la documentación, enlaces a repositorios ajenos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas de idioma del repo no implican capacidades de modelo) |
| Licencia | MIT (declarada en el repo) |
| Formato de pesos | no disponible (el artefacto es un ejecutable `.exe` dentro de un `.zip`) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de modelado. El contenido del repositorio es un binario para Windows x64 (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`, build `v4.2.6`/`D6A82A`) con una contraseña de descompresión (`2026`) documentada en la propia model card.

La model card menciona componentes propios de software de trampas: superposición externa a 144 Hz, suavizado de entrada bezier, escáner dinámico de offsets y descarga mediante tecla `END`. Ninguno de estos elementos constituye un sistema de IA.

## Capacidades

- No hay generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales pese a las etiquetas de idioma.
- No hay modo "thinking", audio ni procesamiento multimodal.
- El artefacto declarado es un ejecutable de Windows x64 distribuido como ZIP.

## Casos de uso

- No procede. Al no ser un modelo de IA, no existen aplicaciones legítimas de inferencia, generación o análisis que puedan construirse sobre él.
- Evaluación de modelos: no aplicable, no hay pesos ni API que evaluar.
- Despliegue en producción: no aplicable y desaconsejado; ejecutar binarios de origen no verificado con contraseña documentada en la model card presenta riesgos de seguridad.
- Investigación en IA: no aporta nada al estado del arte.
- Integración en pipelines: no aplicable, no hay endpoints, tokenizador ni formato de pesos.
- Uso educativo: podría servir únicamente como ejemplo de repositorio mal etiquetado en Hugging Face, no como modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA porque no hay modelo subyacente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay modelo).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles.
- El único requisito declarado es un sistema Windows 10 u 11 de 64 bits para ejecutar el binario, según la model card.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o multimodal sería improcedente.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; las etiquetas de idioma, licencia y pipeline no reflejan capacidades reales.
- Distribuye un ejecutable de Windows con contraseña de descompresión documentada (`2026`) y enlaces a repositorios de GitHub de terceros; el origen y la integridad del binario no están verificados.
- La model card mezcla nombres de paquetes de distintos juegos (`inzoi-cheat-trainer`, `subnautica-2-cheat-trainer`), lo que sugiere contenido reutilizado o generado de forma automática.
- Ejecutar binarios de procedencia desconocida con privilegios de administrador conlleva riesgo de malware; la mención a alertas de Windows Defender y SmartScreen en la propia FAQ es una señal de alarma.
- La licencia MIT declarada no aporta garantías sobre el binario distribuido ni sobre los enlaces externos.
- No debe utilizarse como referencia en evaluaciones técnicas de modelos ni citarse como modelo open source.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anddias/subnautica-2-cheat-trainer
- Enlace de descarga citado en la model card (GitHub, no verificado): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/shirleyrichardson/subnautica-2-cheat-trainer
- Paper, blog o demo oficial: no disponible.
