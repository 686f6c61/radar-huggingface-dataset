# Rootless67/fish-it-script

## Resumen

`Rootless67/fish-it-script` no es un modelo de inteligencia artificial. Es un repositorio de Hugging Face que distribuye un ejecutable para Windows x64 presentado como "script" para un juego, con características propias de un cheat: overlay externo con cajas delimitadoras 2D/3D y esqueletos, lectura directa de memoria en modo usuario, suavizado de entrada con curvas de Bézier, exclusión de capturas de pantalla en OBS/ShadowPlay/Discord y tecla de pánico. El paquete se entrega como un ZIP de 8,9 MB protegido con contraseña (`2026`) que contiene `fish-it-script-v1.2.0-win64.exe`.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. La model card es una página de descarga con insignias, instrucciones de extracción y un FAQ orientado a evitar advertencias de Windows Defender y SmartScreen. Los tags de idioma (14 idiomas) y la licencia MIT declarada no corresponden a capacidades del artefacto, sino a metadatos de la publicación.

Por tanto, esta ficha documenta lo que el repositorio es realmente —un binario de terceros sin verificar— y advierte de los riesgos asociados. No se puede evaluar como modelo: no hay arquitectura, parámetros, contexto ni benchmarks. Cualquier uso en producción es desaconsejable por motivos de seguridad, no de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como modelo; la publicación declara en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT (declarada en los metadatos de Hugging Face) |
| Formato de pesos | no disponible; el artefacto distribuido es `fish-it-script-v1.2.0-win64.zip` (8,9 MB) con `fish-it-script-v1.2.0-win64.exe` |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario PE para Windows x64 (`v4.2.2`, build `4A0D0F575B`) que, según la descripción del autor, opera en modo usuario leyendo memoria de otro proceso y renderizando un overlay mediante Desktop Duplication. La model card menciona 11 hilos de trabajo para el núcleo y 7 para el suavizado de entrada, con un consumo declarado inferior a 65 MB de RAM y una latencia de respuesta inferior a 27 ms.

No hay información sobre tokens de entrenamiento, composición de dataset, RLHF, DPO ni ninguna técnica de aprendizaje. El ZIP se distribuye con contraseña de extracción, un patrón habitual para evadir análisis automatizados de malware, y la propia documentación reconoce que el binario es un "game cheat" y explica cómo sortear avisos de SmartScreen.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos de la publicación.
- Según el autor, el binario ofrece: overlay externo a 144 Hz o más con cajas 2D/3D, esqueletos y ESP de distancia; lectura de memoria en modo usuario sin hooks de DLL; perfiles JSON con intercambio en caliente; tecla de pánico (`END`) para descarga inmediata; suavizado de entrada con curvas de Bézier y radio de FOV configurable; y capa de render excluida de capturas de pantalla.
- Estas capacidades no han sido verificadas de forma independiente y no se corresponden con ninguna funcionalidad de modelo de IA.

## Casos de uso

- Ninguno recomendado en el ámbito de IA: el repositorio no contiene un modelo que pueda desplegarse, evaluarse ni integrarse en pipelines.
- Auditoría de seguridad defensiva: analizar el binario en un entorno aislado para comprender técnicas de evasión (ZIP con contraseña, instrucciones para desactivar SmartScreen, exclusión de capturas) y alimentar reglas de detección.
- Investigación de malware y cheatware: estudiar el patrón de publicación en Hugging Face de binarios ajenos al ecosistema de modelos, útil para políticas de moderación de plataformas.
- Formación en concienciación: usar la model card como ejemplo didáctico de ingeniería social (insignias falsas de descargas y valoraciones, FAQ que normaliza advertencias del sistema operativo).
- Análisis de cadena de suministro: rastrear el repositorio de GitHub enlazado (`ManfredMorgan30/fish-it-script`) y comprobar la relación entre la cuenta de Hugging Face y la de GitHub.
- Documentación de riesgos para equipos de cumplimiento: registrar que el artefacto no es un modelo y que su descarga implica ejecutar código de terceros no firmado con privilegios de administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara métricas operativas no verificadas (respuesta inferior a 27 ms, menos de 65 MB de RAM, 11 y 7 hilos de trabajo), que no son comparables con benchmarks de modelos de IA.

## Requisitos de hardware

- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- SO objetivo: Windows 10 u 11 de 64 bits, sobre CPU Intel o AMD x64.
- Ejecución: el autor indica ejecutar `fish-it-script-v1.2.0-win64.exe` como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: solo las cifras declaradas por el autor (menos de 27 ms, menos de 65 MB de RAM), sin verificación independiente.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Frente a un modelo de lenguaje real, la comparación es categóricamente inválida: no hay parámetros, contexto, licencia de pesos ni artefactos de inferencia que comparar.

| Criterio | `Rootless67/fish-it-script` | Modelo de IA típico en HF |
|---|---|---|
| Naturaleza del artefacto | Ejecutable Win64 en ZIP | Pesos en safetensors/GGUF |
| Pesos | No | Sí |
| Contexto | No aplica | Medible en tokens |
| Benchmarks | No | Habitualmente publicados |
| Verificabilidad | Nula (binario ofuscado, contraseña) | Alta (pesos auditables) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en comparativas, catálogos ni evaluaciones técnicas.
- Riesgo de seguridad elevado: ejecutable de origen desconocido, sin firma, distribuido en ZIP con contraseña y con instrucciones para desactivar protecciones de Windows.
- El propio autor reconoce que es un "game cheat"; su uso puede violar los términos de servicio de juegos y acarrear suspensiones o acciones legales.
- La licencia MIT declarada no garantiza nada sobre el binario: no hay código fuente ni pesos que auditar.
- Las insignias de descargas (108K+) y valoración (4,8/5) de la model card no son verificables y contradicen el contador real de Hugging Face (0 descargas, 0 likes).
- Los 14 idiomas declarados son metadatos sin respaldo funcional.
- Riesgo de cadena de suministro: el enlace de descarga apunta a un repositorio de GitHub de un tercero, no al propio Hugging Face.
- No apto para producción en ningún contexto de IA, ni siquiera como componente auxiliar.
- Cualquier análisis debe realizarse en máquina virtual o sandbox sin red y sin credenciales.

## Enlaces

- Hugging Face: https://huggingface.co/Rootless67/fish-it-script
- Repositorio de GitHub enlazado en la model card: https://github.com/ManfredMorgan30/fish-it-script
- Descarga directa citada por el autor: https://github.com/ManfredMorgan30/fish-it-script/releases/latest/download/fish-it-script-v1.2.0-win64.zip
- Página de releases citada por el autor: https://github.com/ManfredMorgan30/fish-it-script/releases/latest
