# fedebenelli/envolvente-fases

## Resumen

Envolvente de fases interactiva (P-T) es una aplicación web didáctica publicada como Space de HuggingFace (sdk Gradio 5.0.0) por el usuario fedebenelli. No es un modelo de lenguaje ni una red neuronal: es una herramienta de cálculo termodinámico que construye y representa la envolvente de fases presión-temperatura de una mezcla multicomponente de hidrocarburos y CO₂, empleando la ecuación de estado Peng-Robinson 78 con regla de mezcla QMR a través de la librería `yaeos`.

El artefacto resuelve un problema concreto de ingeniería y docencia: dada una composición de mezcla, calcular de forma interactiva dónde se sitúan las ramas de líquido y vapor y el punto crítico, y cómo se desplazan al variar la proporción de gases, CO₂, componentes intermedios y pesados. La interfaz permite fijar la participación de cada grupo con sliders maestros —que reescalan el resto de componentes— y afinar después la distribución interna con sliders individuales.

Su relevancia es acotada y muy específica: sirve como demo reproducible de un cálculo de equilibrio líquido-vapor multicomponente (13 componentes efectivos) en unos 60 ms por evaluación, con caché que hace instantáneas las repeticiones. La model card documenta una verificación numérica contra el `script.py` original: la envolvente por defecto produce 285 puntos, con T entre 199,2 y 784,8 K, P entre 1 y 269,5 bar, y punto crítico en 643,6 K y 223,3 bar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Modelo termodinámico: ecuación de estado Peng-Robinson 78 con regla de mezcla QMR, implementada sobre la librería `yaeos`; interfaz Gradio 5.0.0 |
| Parametros totales | No aplica. 13 componentes efectivos (el `script.py` original incluía 14; se eliminó C50-C80A); matriz de interacción binaria `kij` descrita como 14×14 y simétrica |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible. La model card está redactada en castellano y la interfaz usa etiquetas en castellano, pero no se declara soporte de idiomas |
| Licencia | No disponible |
| Formato de pesos | No aplica. Código Python (`app.py`, `envelope_model.py`, `script.py`) más `requirements.txt` |
| Tipo de artefacto | Space de HuggingFace (Gradio, puerto 7860) |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | No disponible |
| Fecha de creación | 2026-10-13 |
| Última actualización | 2026-10-13 |

## Arquitectura y entrenamiento

No existe entrenamiento. El núcleo del sistema es un cálculo determinista de envolvente de fases: se parte de una composición normalizada `z`, de las propiedades críticas (temperatura crítica, presión crítica y factor acéntrico) de cada componente y de la matriz de interacción binaria `kij`, y se resuelve el equilibrio líquido-vapor con Peng-Robinson 78 y regla de mezcla QMR mediante `yaeos`. El resultado se traza como curva P-T con las ramas de líquido y vapor diferenciadas por color y el punto crítico marcado.

La implementación separa responsabilidades en tres ficheros: `script.py` conserva el cálculo original como referencia (incluye C50-C80A), `envelope_model.py` contiene el modelo termodinámico, el cálculo de la envolvente, la caché y el tratamiento de errores, y `app.py` define el layout Gradio y los callbacks. La decisión de diseño más destacable es la exclusión completa del componente C50-C80A (asfaltenos): no aparece en `z`, ni en `tc/pc/w`, ni en `kij`. El autor indica que `kij` (14×14, simétrica), la normalización de `z` y las envolventes se verificaron contra `script.py` antes de esa eliminación. Como salvaguarda, las composiciones extremas devuelven un aviso en la interfaz en lugar de provocar un fallo de la aplicación.

## Capacidades

- Cálculo de la envolvente de fases presión-temperatura de una mezcla de 13 componentes (gases, CO₂, intermedios y pesados) con Peng-Robinson 78 y regla de mezcla QMR.
- Localización y representación gráfica del punto crítico, junto con las ramas de líquido y vapor coloreadas.
- Control interactivo de la composición: un slider maestro por grupo que fija su participación global y reescala los componentes, más sliders individuales para la distribución interna de cada grupo.
- Gráfica de barras de la composición actual por componente, coloreada por grupo y con la composición por defecto como referencia.
- Tratamiento de errores: las composiciones extremas muestran un aviso en lugar de romper la app.
- Caché de resultados: cada cálculo tarda aproximadamente 60 ms y las repeticiones son instantáneas.
- Reutilización programática: `envelope_model.py` puede importarse como módulo Python en otros proyectos.
- No dispone de generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, function calling ni capacidades de agente. No es un modelo fundacional.

## Casos de uso

- Docencia de termodinámica de equilibrio de fases: el alumnado mueve los sliders y observa en tiempo real cómo la adición de gases ligeros desplaza la envolvente y el punto crítico, sin necesidad de programar ni de disponer de un simulador comercial.
- Formación interna de ingeniería de procesos: usar la app como banco de pruebas para explicar el efecto de la regla de mezcla QMR y de la matriz `kij` sobre la forma de la envolvente.
- Análisis de sensibilidad rápido de composiciones: cuantificar cuánto se desplaza la presión de rocío o de burbuja al variar la fracción de CO₂ o de pesados, en unos 60 ms por evaluación.
- Estimación preliminar de condiciones de operación: obtener un orden de magnitud de las ventanas P-T de interés (por ejemplo, T 199,2-784,8 K y P 1-269,5 bar en la composición por defecto) antes de pasar a un simulador de proceso completo.
- Integración en scripts y pipelines internos de cálculo: importar `envelope_model.py` para generar envolventes de forma desatendida sobre barridos de composición, aprovechando la caché en evaluaciones repetidas.
- Contraste cualitativo con datos experimentales o de laboratorio: generar la envolvente calculada y compararla visualmente con medidas PVT para detectar discrepancias gruesas de composición o de parámetros de interacción.
- Publicación de una demo reproducible: desplegar el Space como URL pública para que terceros reproduzcan el cálculo sin instalar dependencias locales.
- Actividades de aula invertida sobre mezclas con CO₂: el grupo de CO₂ tiene slider propio, lo que permite estudiar su efecto relativo frente a los gases ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí documenta valores de verificación funcional, que se reproducen a continuación:

| Metrica | Valor |
|---|---|
| Puntos de la envolvente por defecto | 285 |
| Rango de temperatura | 199,2 - 784,8 K |
| Rango de presion | 1 - 269,5 bar |
| Punto critico | 643,6 K / 223,3 bar |
| Tiempo por calculo | ~60 ms |
| Tiempo con cache | Instantaneo |
| Componentes efectivos | 13 (C50-C80A excluido) |

No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje, porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- GPU: no necesaria. El cálculo es una resolución de ecuación de estado para 13 componentes y se ejecuta en CPU.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica; no se declara ningún requisito de aceleración por hardware.
- ¿Cabe en una GPU de consumo? La pregunta no aplica; cabe en cualquier equipo capaz de ejecutar Python y Gradio.
- RAM y CPU: no disponibles. No se declaran requisitos mínimos en la información proporcionada.
- Almacenamiento: no disponible; las dependencias se listan en `requirements.txt`, cuyo contenido no se detalla.
- Opciones de despliegue: ejecución local con `pip install -r requirements.txt` y `python app.py`, sirviendo en `http://localhost:7860`; despliegue como Space de HuggingFace con SDK Gradio 5.0.0 y puerto 7860. No se mencionan Docker, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia: aproximadamente 60 ms por cálculo; instantánea cuando el resultado está en caché.
- Throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de artefactos comparables. Los resultados de la búsqueda web asociada no guardan ninguna relación con este Space (son páginas de ficción, perfiles de DeviantArt y listados de libros), por lo que no permiten establecer comparaciones. No se dispone de información verificada sobre alternativas equivalentes de envolvente de fases en HuggingFace ni sobre sus parámetros, contexto, licencia o rendimiento.

| Artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fedebenelli/envolvente-fases | 13 componentes efectivos (PR78 + QMR) | No aplica | ~60 ms por cálculo; 285 puntos de envolvente por defecto | No disponible | Space público en HuggingFace; 0 descargas y 0 likes |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no admite prompts. Cualquier expectativa de uso como LLM es un error de categoría.
- Licencia no declarada: no se especifica ninguna licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal. Conviene contactar con el autor antes de integrarlo en un producto.
- Modelo termodinámico restringido a Peng-Robinson 78 con regla de mezcla QMR: la precisión depende de la calidad de `tc/pc/w` y de `kij`, y no se documentan sus fuentes ni su incertidumbre.
- El componente C50-C80A (asfaltenos) está excluido por completo del modelo. La app no representa el comportamiento de la fracción más pesada y no debe usarse para evaluar precipitación de asfaltenos ni fracciones C50+.
- La composición por defecto corresponde al `script.py` sin el último componente, de modo que las envolventes calculadas no son directamente comparables con las del script original.
- Existe una ambigüedad documental: la model card describe la mezcla como «de 14 componentes» a la vez que indica que se eliminó el último, y menciona una matriz `kij` de 14×14 verificada antes de la eliminación. Conviene revisar el código antes de asumir dimensiones.
- Riesgo de resultados poco fiables en composiciones extremas: la app los detecta y muestra un aviso, pero no se documenta el criterio exacto de validación ni el rango de composiciones considerado válido.
- Ausencia de benchmarks y de validación contra datos experimentales: la única verificación declarada es la coincidencia con `script.py` y unos pocos valores numéricos. No hay tests automatizados mencionados.
- Sin tracción ni mantenimiento verificable: 0 descargas, 0 likes y creación y última actualización separadas por menos de un minuto, lo que sugiere un Space de un solo autor sin histórico de mantenimiento.
- Idiomas de la interfaz no declarados oficialmente; la model card está en castellano, pero no se garantiza localización.
- El cálculo es puramente termodinámico y de equilibrio; no incluye cinética, transporte, ni validación de régimen.

## Enlaces

- HuggingFace: https://huggingface.co/fedebenelli/envolvente-fases
- Ficheros del Space: https://huggingface.co/fedebenelli/envolvente-fases/tree/main
- Librería yaeos (dependencia principal): https://pypi.org/project/yaeos/
- Resultados de la búsqueda web: no relevantes. Ninguno de los enlaces devueltos (FictionPress, DeviantArt, Goodreads, A&E, Wattpad) guarda relación con el modelo ni con termodinámica de fases.
