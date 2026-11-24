# samarsinghhh/path-of-exile-2-map-hack-keyless

## Resumen

El repositorio `samarsinghhh/path-of-exile-2-map-hack-keyless` no contiene un modelo de inteligencia artificial. Se trata de un paquete alojado en Hugging Face cuyo contenido real es un supuesto ejecutable para Windows (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe`) distribuido en un archivo ZIP de 4,8 MB protegido con contraseña. La model card describe funcionalidades propias de un *cheat* o *trainer* para el videojuego Path of Exile 2: superposición externa a 144 Hz, cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, suavizado de entrada con curvas de Bézier, tecla de pánico y ocultación frente a capturas de pantalla.

No existe ninguna arquitectura de red neuronal asociada: no hay pesos, no hay tokenizador, no hay configuración de transformer, MoE ni SSM. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y el pipeline vacío confirman que se ha utilizado Hugging Face como canal de distribución de software binario, no como repositorio de modelos. El identificador interno del supuesto build es `v3.3.3 (C154A0)`.

Desde el punto de vista de la evaluación técnica, este artefacto es relevante únicamente como caso de abuso de la plataforma y como posible vector de malware: un binario ofuscado, protegido por contraseña y con referencias cruzadas a repositorios de GitHub de terceros que no coinciden con el nombre del paquete. No debe descargarse ni ejecutarse en ningún entorno, y menos aún en máquinas de desarrollo o investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni ONNX) |

## Arquitectura y entrenamiento

No aplica. El paquete no contiene ningún modelo entrenado, ni datos de entrenamiento, ni proceso de ajuste (RLHF, DPO, SFT). La model card describe mecánicas de un programa de asistencia para videojuegos: lectura de memoria del proceso del juego, renderizado de superposición mediante Desktop Duplication, escaneo dinámico de offsets tras parches del juego, sondeo a 152 Hz y suavizado de entrada. Ninguna de estas afirmaciones es verificable a partir del contenido publicado, y no se aporta código fuente, hash del binario ni firmas de build.

El único "entrenamiento" implícito sería el ajuste manual de offsets contra versiones concretas del cliente de Path of Exile 2, algo que el autor menciona como "resolución automática de firmas de punteros tras parches", pero sin detallar el mecanismo. Tampoco se documenta el proceso de compilación, las dependencias enlazadas ni las llamadas al sistema que realiza el ejecutable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) no se corresponden con ninguna funcionalidad descrita; probablemente son etiquetas para posicionamiento en búsquedas.
- Funcionalidad declarada (no verificada): superposición externa con cajas 2D/3D, esqueletos, ESP de distancia, tecla de pánico `END`, suavizado de apuntado con curvas de Bézier, ocultación frente a OBS, ShadowPlay y Discord.
- No hay evidencias de que el binario realice lo que promete; el nombre del ejecutable hace referencia a otro juego (*Monster Hunter Wilds*), lo que sugiere una plantilla reutilizada.

## Casos de uso

Ninguno legítimo en el ámbito de la IA, el desarrollo o la investigación. Los escenarios realistas son de naturaleza defensiva o analítica:

- Análisis de malware: el artefacto puede estudiarse en una máquina virtual aislada y sin red para caracterizar técnicas de empaquetado, contraseñas en archivos ZIP y evasión de capturas de pantalla.
- Formación en ciberseguridad: sirve como ejemplo de repositorio abusivo en Hugging Face y de cómo los atacantes aprovechan la confianza en plataformas de modelos para distribuir binarios.
- Elaboración de políticas de ingesta: permite justificar reglas que bloqueen la descarga de artefactos sin `config.json`, sin `safetensors` y con ejecutables en el árbol de archivos.
- Detección y bloqueo: alimenta listas de IoC (indicadores de compromiso) con el nombre del ZIP, la contraseña `2026` y las URL de GitHub referenciadas.
- Auditoría de licencias: aunque la licencia declarada es MIT, el contenido no es código fuente ni un modelo, por lo que la licencia no aporta garantías sobre el binario.
- Concienciación de usuarios: documenta el riesgo de ejecutar "trucos" o *trainers* descargados de repositorios no oficiales, que suelen acompañarse de troyanos, *stealers* o *ransomware*.
- Investigación de mercado de videojuegos: solo como muestra de la economía de *cheats* y de su distribución a través de plataformas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paquete no incluye métricas de ningún tipo; las cifras que aparecen en la model card (144 Hz, 152 Hz de sondeo, 97,6 % de consistencia, 10 hilos de trabajo) son afirmaciones de marketing sin metodología ni evidencia reproducible, y no deben interpretarse como rendimiento medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 22H2 y Windows 11 24H2, x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un ejecutable de Windows que, según la model card, requiere ejecutarse "como administrador".
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Tamaño del paquete: 4,8 MB comprimido, con contraseña `2026`.

## Comparativa con modelos similares

No procede. No existe una categoría de "modelos" comparable porque el artefacto no es un modelo de IA. A modo de contraste con repositorios legítimos de la misma plataforma:

| Criterio | Este paquete | Modelo de IA típico en HF |
|---|---|---|
| Contenido | ZIP con `.exe` de Windows | Pesos en safetensors/GGUF + config |
| Pesos | Ausentes | Presentes y versionados |
| Tokenizador | Ausente | Presente |
| Pipeline | Vacío | `text-generation`, `image-text-to-text`, etc. |
| Reproducibilidad | Nula (binario opaco) | Alta (pesos y código) |
| Licencia aplicable | MIT declarada sin código | MIT/Apache-2.0/etc. sobre pesos |
| Riesgo de seguridad | Alto (ejecutable ofuscado) | Bajo si se inspecciona el contenido |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje, visión o código es improcedente.
- Riesgo de seguridad elevado: un `.exe` de 4,8 MB protegido con contraseña, sin firma digital ni hash publicado, es un vector clásico de troyanos, *info-stealers* y *ransomware*.
- Inconsistencia de nombres: el paquete se llama Path of Exile 2, pero el ejecutable y el ZIP hacen referencia a *Monster Hunter Wilds*; las URL de descarga apuntan a repositorios de GitHub de terceros (`Giovanni9790`, `fHakansson955`) que no coinciden con el autor del repo en Hugging Face.
- Posible violación de términos de servicio del videojuego y de la propia plataforma Hugging Face; el uso de *cheats* en juegos multijugador suele conllevar el baneo de la cuenta.
- Licencia MIT declarada sin código fuente: no otorga ninguna garantía sobre el binario ni sobre su comportamiento.
- Idiomas declarados (14) sin funcionalidad asociada; probablemente etiquetas para SEO.
- Cero descargas y cero *likes* en el momento de la consulta, lo que sugiere un repositorio de reciente creación y sin validación comunitaria.
- No debe ejecutarse en entornos de producción, investigación ni en máquinas con credenciales; si se analiza, hacerlo en una VM desechable sin red y con instantáneas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/samarsinghhh/path-of-exile-2-map-hack-keyless
- URL de descarga citada en la model card (no verificar ni ejecutar): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Repositorio de GitHub referenciado en la model card: https://github.com/fHakansson955/path-of-exile-2-map-hack-keyless
- Documentación de Hugging Face sobre contenido no permitido: https://huggingface.co/docs/hub/security
